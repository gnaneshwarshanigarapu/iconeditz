import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { z } from 'zod'
import { authenticate, tryAuthenticate } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { createDelivery, sendDeliveryEmail } from '../lib/delivery.js'
import { sendMetaPurchase } from '../lib/metaCapi.js'
import { syncCustomerOnPayment } from '../lib/customerSync.js'
import { logPaymentAttempt } from '../lib/paymentAttemptLog.js'

const checkoutSchema = z.object({
  productId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
  })).optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(20),
})

const verificationSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

const httpError = (message, status) => Object.assign(new Error(message), { status })

const require = createRequire(import.meta.url)
const Razorpay = require('razorpay')
let razorpayClient

const getRazorpay = () => {
  const keyIdPresent = Boolean(process.env.RAZORPAY_KEY_ID)
  const secretPresent = Boolean(process.env.RAZORPAY_KEY_SECRET)
  if (!keyIdPresent || !secretPresent) {
    throw httpError('Payment service temporarily unavailable.', 503)
  }
  razorpayClient ||= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  return razorpayClient
}

async function listOrders(req, res) {
  const user = await authenticate(req)
  const singleOrderId = req.query.id

  if (singleOrderId) {
    // Single order details with SQL joins
    const { data: singleOrder, error: singleErr } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*)), customers(*)')
      .eq('id', singleOrderId)
      .maybeSingle()

    if (singleErr) throw singleErr
    if (!singleOrder) return res.status(404).json({ success: false, message: 'Order not found' })
    return res.json({ success: true, data: singleOrder, order: singleOrder })
  }

  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(*)), products(*)')
    .order('created_at', { ascending: false })

  if (user.role !== 'admin') {
    query = query.eq('user_id', user.sub)
  }

  const { data, error } = await query
  if (error) throw error

  // Format order items with product titles from SQL join
  const formatted = (data || []).map((o) => {
    let items = o.order_items || []
    if (items.length === 0 && (o.product_name || o.products?.title)) {
      items = [
        {
          id: o.id,
          product_id: o.product_id || o.products?.id,
          product_name: o.products?.title || o.product_name || 'Creative Asset',
          quantity: 1,
          unit_price: Number(o.amount || 0),
          total_price: Number(o.amount || 0),
          products: o.products || null,
        },
      ]
    }

    return {
      ...o,
      order_items: items,
      customer_email: o.customer_email || o.user_email || o.email || '',
      customer_name: o.customer_name || o.name || 'Customer',
      customer_phone: o.customer_phone || o.phone || '',
      payment_status: o.payment_status || o.status || 'PAID',
    }
  })

  return res.json({ success: true, data: formatted, orders: formatted })
}

async function createOrder(req, res) {
  const user = await tryAuthenticate(req)
  const { productId, items: rawItems, name, email, phone } = req.body || {}

  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' })
  }

  const parsed = checkoutSchema.safeParse(req.body)
  if (!parsed.success) throw httpError('Invalid checkout request', 400)
  const razorpay = getRazorpay()

  // Collect products to buy
  const itemsToFetch = rawItems && rawItems.length > 0
    ? rawItems
    : productId
    ? [{ productId, quantity: 1 }]
    : []

  if (itemsToFetch.length === 0) throw httpError('No products selected for order', 400)

  const productIds = itemsToFetch.map((i) => i.productId)
  const { data: dbProducts, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('id,title,price,discount_price,published,status')
    .in('id', productIds)

  if (prodErr) throw prodErr
  if (!dbProducts || dbProducts.length === 0) throw httpError('Selected products not found', 404)

  const productMap = new Map(dbProducts.map((p) => [p.id, p]))

  let totalAmountPaise = 0
  const orderItemsData = []

  for (const item of itemsToFetch) {
    const prod = productMap.get(item.productId)
    if (!prod) continue
    const unitPrice = Number(prod.discount_price ?? prod.price)
    const lineTotalPaise = Math.round(unitPrice * 100) * item.quantity
    totalAmountPaise += lineTotalPaise

    orderItemsData.push({
      product_id: prod.id,
      product_name: prod.title,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: unitPrice * item.quantity,
    })
  }

  if (!totalAmountPaise || totalAmountPaise < 100) {
    return res.status(400).json({ success: false, error: 'The payment amount must be at least 100 paise' })
  }

  const firstProdName = orderItemsData[0]?.product_name || 'Creative Asset'

  // Ensure Customer record exists for Guest / Authenticated User
  await syncCustomerOnPayment({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
  }).catch(() => {})

  // Insert Order
  const { data: databaseOrder, error: databaseError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user?.sub || null,
      product_id: orderItemsData[0]?.product_id || null,
      product_name: firstProdName,
      customer_name: name.trim(),
      customer_email: email.trim().toLowerCase(),
      customer_phone: phone.trim(),
      amount: totalAmountPaise / 100,
      total_amount: totalAmountPaise / 100,
      currency: 'INR',
      payment_status: 'pending',
      status: 'pending',
      payment_method: 'razorpay',
    })
    .select('id')
    .single()

  if (databaseError || !databaseOrder) {
    return res.status(500).json({ success: false, error: databaseError?.message || 'Unable to create order' })
  }

  // Insert normalized order_items
  const itemsWithOrderId = orderItemsData.map((item) => ({ ...item, order_id: databaseOrder.id }))
  const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(itemsWithOrderId)
  if (itemsErr) console.warn('Order items insert notice:', itemsErr.message)

  const receipt = databaseOrder.id
  let razorpayOrder
  try {
    const order = await razorpay.orders.create({
      amount: totalAmountPaise,
      currency: 'INR',
      receipt,
    })
    razorpayOrder = order
  } catch (error) {
    console.error('Razorpay order creation failed:', error.message)
    await supabaseAdmin.from('orders').delete().eq('id', databaseOrder.id)
    return res.status(502).json({ success: false, message: 'Payment service temporarily unavailable.' })
  }

  if (!razorpayOrder?.id) throw new Error('Razorpay returned an invalid order response')

  await supabaseAdmin
    .from('orders')
    .update({ razorpay_order_id: razorpayOrder.id, order_id: razorpayOrder.id })
    .eq('id', databaseOrder.id)

  logPaymentAttempt({
    order_id: databaseOrder.id,
    razorpay_order_id: razorpayOrder.id,
    amount: totalAmountPaise / 100,
    currency: 'INR',
    status: 'initiated',
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    webhook_event: 'order.created',
  }).catch(() => {})

  return res.status(201).json({
    success: true,
    key_id: process.env.RAZORPAY_KEY_ID,
    order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  })
}

async function verifyPayment(req, res) {
  const user = await tryAuthenticate(req)
  const parsed = verificationSchema.safeParse(req.body)
  if (!parsed.success) throw httpError('Missing or invalid payment verification fields', 400)
  const input = parsed.data
  const secret = process.env.RAZORPAY_KEY_SECRET
  const razorpay = getRazorpay()

  // 1. HMAC Verification
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(input.razorpay_signature, 'utf8')
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    logPaymentAttempt({
      razorpay_order_id: input.razorpay_order_id,
      razorpay_payment_id: input.razorpay_payment_id,
      status: 'failed',
      gateway_error_code: 'BAD_SIGNATURE',
      gateway_error_description: 'HMAC SHA256 signature verification failed',
      webhook_event: 'payment.failed',
    }).catch(() => {})
    throw httpError('Invalid payment signature', 400)
  }

  // 2. Fetch Order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,product_id,product_name,customer_name,customer_email,customer_phone,amount,payment_status,created_at,products(download_key,download_filename)')
    .or(`razorpay_order_id.eq.${input.razorpay_order_id},order_id.eq.${input.razorpay_order_id}`)
    .maybeSingle()

  if (orderError) throw orderError
  if (!order) throw httpError('Order not found', 404)

  // 3. Fetch Real Payment from Razorpay API
  const payment = await razorpay.payments.fetch(input.razorpay_payment_id)
  if (
    payment.order_id !== input.razorpay_order_id ||
    payment.currency !== 'INR' ||
    payment.amount !== Math.round(Number(order.amount) * 100) ||
    payment.status !== 'captured'
  ) {
    logPaymentAttempt({
      order_id: order.id,
      razorpay_order_id: input.razorpay_order_id,
      razorpay_payment_id: input.razorpay_payment_id,
      amount: order.amount,
      status: 'failed',
      gateway_error_code: 'PAYMENT_MISMATCH',
      gateway_error_description: `Payment status ${payment.status} or amount mismatch`,
      webhook_event: 'payment.failed',
      raw_response: payment,
    }).catch(() => {})
    throw httpError('Payment details do not match the order', 400)
  }

  // 4. Update Order to PAID
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'PAID',
      status: 'paid',
      razorpay_payment_id: input.razorpay_payment_id,
      razorpay_signature: input.razorpay_signature,
      payment_method: payment.method || 'razorpay',
    })
    .eq('id', order.id)

  if (updateError) throw updateError

  // 5. Recalculate Customer LTV strictly from PAID orders
  await syncCustomerOnPayment({
    name: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
  })

  // 6. Log Captured Payment Attempt
  logPaymentAttempt({
    order_id: order.id,
    razorpay_order_id: input.razorpay_order_id,
    razorpay_payment_id: input.razorpay_payment_id,
    amount: order.amount,
    currency: 'INR',
    status: 'captured',
    payment_method: payment.method || 'razorpay',
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    webhook_event: 'payment.captured',
    raw_response: payment,
  }).catch(() => {})

  // 7. Delivery & Receipt
  let delivery
  let emailSent = false
  try {
    delivery = await createDelivery(order)
    await supabaseAdmin.from('download_logs').insert({
      user_id: order.user_id,
      product_id: order.product_id,
      order_id: order.id,
      ip_address: req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
      download_count: 0,
    }).catch(() => {})
    try {
      await sendDeliveryEmail(order, delivery)
      emailSent = true
    } catch (error) {
      console.error('Delivery email failed:', error.message)
    }
  } catch (error) {
    console.error('Delivery generation failed:', error.message)
  }

  const eventId = `purchase_${order.id}`
  sendMetaPurchase(req, order, eventId).catch(() => {})

  return res.json({
    success: true,
    ...(delivery || {}),
    orderId: order.id,
    product: order.product_name,
    amount: order.amount,
    emailSent,
    eventId,
    message: 'Payment verified successfully',
  })
}

export default withApi({ GET: listOrders, POST: createOrder, PUT: verifyPayment })
