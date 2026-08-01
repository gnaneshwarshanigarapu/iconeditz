import crypto from 'node:crypto'
import Razorpay from "razorpay"
import { z } from 'zod'
import { authenticate } from '../server/lib/auth.js'
import { withApi } from '../server/lib/handler.js'
import { supabaseAdmin } from '../server/lib/supabaseAdmin.js'

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

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw httpError('Razorpay is not configured', 500)
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
}

async function listOrders(req, res) {
  const user = await authenticate(req)
  let query = supabaseAdmin.from('orders').select('*, products(*)').order('created_at', { ascending: false })
  if (user.role !== 'admin') query = query.eq('user_id', user.sub)
  const { data, error } = await query
  if (error) throw error
  return res.json({ success: true, data: data || [] })
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
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw httpError('Razorpay is not configured', 500)
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id,title,price,discount_price,published,status')
    .eq('id', productId)
    .is('deleted_at', null)
    .maybeSingle()
  if (productError) throw productError
  if (!product) throw httpError('Product not found', 404)
  if (!product.published || product.status !== 'published') throw httpError('Product is not published', 400)

  const amount = Math.round(Number(product.discount_price ?? product.price) * 100)
  if (!Number.isSafeInteger(amount) || amount < 100) throw httpError('The payment amount must be at least 100 paise', 400)

  console.log(req.body)
  const { data: databaseOrder, error: databaseError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user.sub,
      product_id: product.id,
      product_name: product.title,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      amount: amount / 100,
      payment_status: 'pending',
      status: 'pending',
    })
    .select('id')
    .single()
  if (databaseError || !databaseOrder) {
    return res.status(500).json({
      success: false,
      error: databaseError?.message || 'Unable to create the local order',
    })
  }

  console.info(JSON.stringify({ event: 'razorpay_order_create', productId: product.id, amount, userId: user.sub }))
  console.log({
    keyPresent: !!process.env.RAZORPAY_KEY_ID,
    secretPresent: !!process.env.RAZORPAY_KEY_SECRET,
  })
  const receipt = databaseOrder.id
  let razorpayOrder
  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
    })
    razorpayOrder = order
  } catch (err) {
    console.error("FULL RAZORPAY ERROR", err)

    return res.status(500).json({
      success: false,
      source: "razorpay",
      message: err.message,
      stack: err.stack,
      raw: JSON.stringify(err, Object.getOwnPropertyNames(err))
    })
  }
  if (!razorpayOrder?.id) throw new Error('Razorpay returned an invalid order response')

  const { error: updateError } = await supabaseAdmin.from('orders').update({ order_id: razorpayOrder.id }).eq('id', databaseOrder.id)
  if (updateError) throw updateError
  return res.status(201).json({ success: true, order_id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency })
}

async function verifyPayment(req, res) {
  const user = await authenticate(req)
  const parsed = verificationSchema.safeParse(req.body)
  if (!parsed.success) throw httpError('Missing or invalid payment verification fields', 400)
  const input = parsed.data
  const secret = process.env.RAZORPAY_KEY_SECRET
  const razorpay = getRazorpay()

  const expected = crypto.createHmac('sha256', secret).update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`).digest('hex')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(input.razorpay_signature, 'utf8')
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) throw httpError('Invalid payment signature', 400)

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,amount,payment_status')
    .eq('order_id', input.razorpay_order_id)
    .maybeSingle()
  if (orderError) throw orderError
  if (!order) throw httpError('Order not found', 404)
  if (user.role !== 'admin' && order.user_id !== user.sub) throw httpError('Not authorized to verify this order', 403)
  if (order.payment_status === 'PAID') return res.json({ success: true, message: 'Payment already verified' })

  const payment = await razorpay.payments.fetch(input.razorpay_payment_id)
  if (payment.order_id !== input.razorpay_order_id || payment.currency !== 'INR' || payment.amount !== Math.round(Number(order.amount) * 100) || payment.status !== 'captured') {
    throw httpError('Payment details do not match the order', 400)
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ payment_status: 'PAID', status: 'paid', razorpay_payment_id: input.razorpay_payment_id })
    .eq('id', order.id)
  if (updateError) throw updateError
  return res.json({ success: true, message: 'Payment verified successfully' })
}

export default withApi({ GET: listOrders, POST: createOrder, PUT: verifyPayment })
