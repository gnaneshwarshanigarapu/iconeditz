import crypto from 'node:crypto'
import { supabaseAdmin } from '../../lib/supabaseAdmin.js'
import { syncCustomerOnPayment } from '../../lib/customerSync.js'
import { logPaymentAttempt } from '../../lib/paymentAttemptLog.js'
import { createDelivery, sendDeliveryEmail } from '../../lib/delivery.js'

export default async function razorpayWebhookHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method Not Allowed' })
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET
  const signature = req.headers['x-razorpay-signature']

  if (!webhookSecret || !signature) {
    return res.status(400).json({ success: false, error: 'Webhook secret or signature missing' })
  }

  // Raw body verification
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

  if (signature !== expectedSignature) {
    console.error('Razorpay Webhook signature mismatch!')
    return res.status(400).json({ success: false, error: 'Invalid webhook signature' })
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const event = payload.event
  const paymentEntity = payload.payload?.payment?.entity
  const orderEntity = payload.payload?.order?.entity

  console.log(`[Razorpay Webhook] Received event: ${event}`)

  if (event === 'payment.captured' || event === 'order.paid') {
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id
    const razorpayPaymentId = paymentEntity?.id
    const amount = Number(paymentEntity?.amount || orderEntity?.amount || 0) / 100
    const email = paymentEntity?.email || orderEntity?.email
    const phone = paymentEntity?.contact || orderEntity?.phone
    const method = paymentEntity?.method || 'razorpay'

    if (razorpayOrderId) {
      // Find matching order in orders table
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*')
        .or(`razorpay_order_id.eq.${razorpayOrderId},order_id.eq.${razorpayOrderId}`)
        .maybeSingle()

      if (order) {
        // Update Order to PAID
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'PAID',
            status: 'paid',
            razorpay_payment_id: razorpayPaymentId || order.razorpay_payment_id,
            payment_method: method,
          })
          .eq('id', order.id)

        // Sync Customer profile
        await syncCustomerOnPayment({
          name: order.customer_name || email?.split('@')[0],
          email: order.customer_email || email,
          phone: order.customer_phone || phone,
          amount: order.amount || amount,
        })

        // Log payment attempt
        await logPaymentAttempt({
          order_id: order.id,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          amount: order.amount || amount,
          currency: 'INR',
          status: 'captured',
          payment_method: method,
          customer_email: order.customer_email || email,
          customer_phone: order.customer_phone || phone,
          raw_response: payload,
        })

        // Deliver asset email if needed
        try {
          const delivery = await createDelivery(order)
          await sendDeliveryEmail(order, delivery)
        } catch (err) {
          console.warn('[Webhook Delivery Warning]:', err.message)
        }
      }
    }
  } else if (event === 'payment.failed') {
    const razorpayOrderId = paymentEntity?.order_id
    const razorpayPaymentId = paymentEntity?.id
    const amount = Number(paymentEntity?.amount || 0) / 100
    const email = paymentEntity?.email

    await logPaymentAttempt({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      amount,
      status: 'failed',
      error_code: paymentEntity?.error_code || 'PAYMENT_FAILED',
      error_description: paymentEntity?.error_description || 'Payment process failed at gateway',
      raw_response: payload,
    })
  }

  return res.status(200).json({ success: true, event })
}
