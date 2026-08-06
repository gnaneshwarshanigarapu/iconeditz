import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { z } from 'zod'
import { authenticate } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { createDelivery, sendDeliveryEmail } from '../lib/delivery.js'
import { sendMetaPurchase } from '../lib/metaCapi.js'
import { syncCustomerOnPayment } from '../lib/customerSync.js'
import { logPaymentAttempt } from '../lib/paymentAttemptLog.js'

const checkoutSchema = z.object({
  productId: z.string().uuid(),
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
  let query = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false })
  if (user.role !== 'admin') {
    query = query.eq('user_id', user.sub)
  }
  const { data, error } = await query
  if (error) throw error

  // Clean, consistent order list without hardcoded fallback strings
  const formatted = (data || []).map((o) => ({
    ...o,
    customer_email: o.customer_email || o.user_email || o.email || '',
    customer_name: o.customer_name || o.name || 'Customer',
    customer_phone: o.customer_phone || o.phone || '',
    payment_status: o.payment_status || o.status || 'PAID',
  }))

  return res.json({ success: true, data: formatted, orders: formatted })
}

async function createOrder(req, res) {
  const user = await authenticate(req)
  const { productId, name, email, phone } = req.body || {}
  if (!phone) {
    return res.status(400).json({
      success: false,
      error: 'Phone number is required',
    })
  }

  const parsed = checkoutSchema.safeParse(req.body)
  if (!parsed.success) throw httpError('Invalid checkout request', 400)
  const razorpay = getRazorpay()

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id,title,price,discount_price,published,status')
    .eq('id', productId)
    .is('deleted_at', null)
    .maybeSingle()
  if (productError) throw productError
  if (!product) throw httpError('Product not found', 404)

  const amount = Math.round(Number(product.discount_price ?? product.price) * 100)
  if (!amount || amount < 100) {
    return res.status(400).json({ success: false, error: 'The payment amount must be at least 100 paise' })
  }

  const { data: databaseOrder, error: databaseError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user.sub,
      product_id: product.id,
      product_name: product.title,
      customer_name: name.trim(),
      customer_email: email.trim().toLowerCase(),
      customer_phone: phone.trim(),
      amount: amount / 100,
      currency: 'INR',
      payment_status: 'pending',
      status: 'pending',
      payment_method: 'razorpay',
    })
    .select('id')
    .single()

  if (databaseError || !databaseOrder) {
    return res.status(500).json({
      success: false,
      error: databaseError?.message || 'Unable to create order in database',
    })
  }

  const receipt = databaseOrder.id
  let razorpayOrder
  try {
    const order = await razorpay.orders.create({
      amount,
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

  // Log initiated attempt
  logPaymentAttempt({
    order_id: databaseOrder.id,
    razorpay_order_id: razorpayOrder.id,
    amount: amount / 100,
    currency: 'INR',
    status: 'initiated',
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
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
  const user = await authenticate(req)
  const parsed = verificationSchema.safeParse(req.body)
  if (!parsed.success) throw httpError('Missing or invalid payment verification fields', 400)
  const input = parsed.data
  const secret = process.env.RAZORPAY_KEY_SECRET
  const razorpay = getRazorpay()

  // 1. Verify Razorpay HMAC signature
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(input.razorpay_signature, 'utf8')
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    logPaymentAttempt({
      razorpay_order_id: input.razorpay_order_id,
      razorpay_payment_id: input.razorpay_payment_id,
      status: 'failed',
      error_code: 'BAD_SIGNATURE',
      error_description: 'HMAC SHA256 signature verification failed',
    }).catch(() => {})
    throw httpError('Invalid payment signature', 400)
  }

  // 2. Lookup Order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,product_id,product_name,customer_name,customer_email,customer_phone,amount,payment_status,created_at,products(download_key,download_filename)')
    .or(`razorpay_order_id.eq.${input.razorpay_order_id},order_id.eq.${input.razorpay_order_id}`)
    .maybeSingle()

  if (orderError) throw orderError
  if (!order) throw httpError('Order not found', 404)
  if (user.role !== 'admin' && order.user_id !== user.sub) {
    throw httpError('Not authorized to verify this order', 403)
  }

  // 3. Fetch Real Payment Details from Razorpay API
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
      error_code: 'PAYMENT_MISMATCH',
      error_description: `Payment status ${payment.status} or currency/amount mismatch`,
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
      razorpay_order_id: input.razorpay_order_id,
      payment_method: payment.method || 'razorpay',
    })
    .eq('id', order.id)

  if (updateError) throw updateError

  // 5. Aggregate / Sync Customer Record in customers table
  await syncCustomerOnPayment({
    name: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
    amount: order.amount,
  })

  // 6. Log Successful Payment Attempt
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
    raw_response: payment,
  }).catch(() => {})

  // 7. Delivery & Email Notification
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
    })
    try {
      await sendDeliveryEmail(order, delivery)
      emailSent = true
    } catch (error) {
      console.error('Delivery email failed:', error.message)
    }
  } catch (error) {
    console.error('Delivery URL generation failed:', error.message)
  }

  const eventId = `purchase_${order.id}`
  sendMetaPurchase(req, order, eventId).catch((error) => console.error('Meta CAPI failed:', error.message))

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
