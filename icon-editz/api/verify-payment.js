import crypto from 'node:crypto'
import Razorpay from 'razorpay'
import { z } from 'zod'
import { authenticate } from './lib/auth.js'
import { withApi } from './lib/handler.js'
import { supabaseAdmin } from './lib/supabaseAdmin.js'

const verificationSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

const invalidSignature = () => Object.assign(new Error('Invalid payment signature'), { status: 400 })

async function verifyPayment(req, res) {
  const user = await authenticate(req)
  const parsed = verificationSchema.safeParse(req.body)
  if (!parsed.success) throw Object.assign(new Error('Missing or invalid payment verification fields'), { status: 400 })
  const input = parsed.data
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!process.env.RAZORPAY_KEY_ID || !secret) throw Object.assign(new Error('Razorpay is not configured'), { status: 500 })

  const expected = crypto.createHmac('sha256', secret).update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`).digest('hex')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(input.razorpay_signature, 'utf8')
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) throw invalidSignature()

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,amount,payment_status')
    .eq('order_id', input.razorpay_order_id)
    .maybeSingle()
  if (orderError) throw orderError
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 })
  if (user.role !== 'admin' && order.user_id !== user.sub) throw Object.assign(new Error('Not authorized to verify this order'), { status: 403 })
  if (order.payment_status === 'PAID') return res.json({ success: true, message: 'Payment already verified' })

  const payment = await new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: secret }).payments.fetch(input.razorpay_payment_id)
  if (payment.order_id !== input.razorpay_order_id || payment.currency !== 'INR' || payment.amount !== Math.round(Number(order.amount) * 100) || payment.status !== 'captured') {
    throw Object.assign(new Error('Payment details do not match the order'), { status: 400 })
  }

  const { error: updateError } = await supabaseAdmin.from('orders').update({ payment_status: 'PAID', status: 'paid', razorpay_payment_id: input.razorpay_payment_id }).eq('id', order.id)
  if (updateError) throw updateError
  return res.json({ success: true, message: 'Payment verified successfully' })
}

export default withApi(['POST'], verifyPayment)
