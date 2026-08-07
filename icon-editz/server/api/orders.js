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

  const itemsToFetch = rawItems && rawItems.length > 0
    ? rawItems
    : productId
    ? [{ productId, quantity: 1 }]
    : []

  if (itemsToFetch.length === 0) throw httpError('No products selected for order', 400)

  const productIds = itemsToFetch.map((i) => i.productId)
  const { data: dbProducts, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('id,title,slug,category,price,discount_price')
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

  const localOrderId = crypto.randomUUID()
  const firstProduct = dbProducts[0] || {}
  const firstProdName = orderItemsData[0]?.product_name || firstProduct.title || 'Creative Asset'
  const couponCode = req.body?.couponCode || req.body?.coupon || 'none'

  const notes = {
    customer_name: name.trim(),
    customer_email: email.trim().toLowerCase(),
    customer_phone: phone.trim(),
    product_id: String(firstProduct.id || productId || ''),
    product_name: String(firstProdName).substring(0, 100),
    product_slug: String(firstProduct.slug || 'n-a'),
    product_category: String(firstProduct.category || 'digital_asset'),
    local_order_id: String(localOrderId),
    coupon_code: String(couponCode),
    payment_type: 'digital_asset',
    storage_provider: String(process.env.STORAGE_PROVIDER || 'supabase'),
    website: 'icon-editz.com',
    created_by: 'website_checkout',
  }

  const itemsWithOrderId = orderItemsData.map((item) => ({ ...item, order_id: localOrderId }))

  // Concurrent execution of Razorpay Order creation and DB Order creation
  const [razorpayOrder] = await Promise.all([
    razorpay.orders.create({
      amount: totalAmountPaise,
      currency: 'INR',
      receipt: localOrderId,
      notes,
    }),
    supabaseAdmin.from('orders').insert({
      id: localOrderId,
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
    }),
    supabaseAdmin.from('order_items').insert(itemsWithOrderId),
  ])

  if (!razorpayOrder?.id) throw new Error('Razorpay returned an invalid order response')

  // Non-blocking background tasks
  supabaseAdmin
    .from('orders')
    .update({ razorpay_order_id: razorpayOrder.id, order_id: razorpayOrder.id })
    .eq('id', localOrderId)
    .catch(() => {})

  syncCustomerOnPayment({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() }).catch(() => {})
  logPaymentAttempt({
    order_id: localOrderId,
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

  // 1. Instant HMAC SHA256 Signature Check
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(input.razorpay_signature, 'utf8')
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    console.error(`[Payment Verification] Signature verification FAILED for order ${input.razorpay_order_id}`)
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

  // 2. Concurrent DB Order retrieval and Razorpay API Payment Verification
  const [orderResult, payment] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('id,user_id,product_id,product_name,customer_name,customer_email,customer_phone,amount,payment_status,products(download_key,download_filename)')
      .or(`razorpay_order_id.eq.${input.razorpay_order_id},order_id.eq.${input.razorpay_order_id}`)
      .maybeSingle(),
    razorpay.payments.fetch(input.razorpay_payment_id),
  ])

  const order = orderResult.data
  if (orderResult.error || !order) {
    console.error(`[Order Verification] Order ${input.razorpay_order_id} not found in database`)
    throw httpError('Order not found', 404)
  }

  if (
    payment.order_id !== input.razorpay_order_id ||
    payment.currency !== 'INR' ||
    payment.amount !== Math.round(Number(order.amount) * 100) ||
    payment.status !== 'captured'
  ) {
    console.error(`[Payment Verification] Payment mismatch or invalid status: ${payment.status}`)
    throw httpError('Payment details do not match the order', 400)
  }

  // 3. Concurrently Update Order to PAID + Generate Signed Download URL
  const [delivery] = await Promise.all([
    createDelivery(order),
    supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'PAID',
        status: 'paid',
        razorpay_payment_id: input.razorpay_payment_id,
        razorpay_signature: input.razorpay_signature,
        payment_method: payment.method || 'razorpay',
      })
      .eq('id', order.id),
  ])

  // 4. Non-blocking Background Tasks
  syncCustomerOnPayment({
    name: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
  }).catch(() => {})

  supabaseAdmin.from('download_logs').insert({
    user_id: order.user_id,
    product_id: order.product_id,
    order_id: order.id,
    ip_address: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1',
    download_count: 0,
  }).catch(() => {})

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

  // 5. Background Email Dispatch (Strictly when RESEND_ENABLED === 'true')
  if (process.env.RESEND_ENABLED === 'true') {
    sendDeliveryEmail(order, delivery)
      .then(() => {
        supabaseAdmin.from('orders').update({ email_status: 'sent' }).eq('id', order.id).catch(() => {})
      })
      .catch((err) => {
        supabaseAdmin.from('orders').update({ email_status: `failed: ${err.message}` }).eq('id', order.id).catch(() => {})
      })
  }

  // 6. Instant Response (<300ms)
  const eventId = `purchase_${order.id}`
  sendMetaPurchase(req, order, eventId).catch(() => {})

  return res.json({
    success: true,
    downloadUrl: delivery?.downloadUrl || null,
    expiresAt: delivery?.expiresAt || null,
    orderId: order.id,
    product: order.product_name,
    amount: order.amount,
    eventId,
    message: 'Payment verified successfully',
  })
}

export default withApi({ GET: listOrders, POST: createOrder, PUT: verifyPayment })
