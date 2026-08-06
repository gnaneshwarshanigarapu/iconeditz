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

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

  if (signature !== expectedSignature) {
    console.error('[Razorpay Webhook] Signature mismatch!')
    return res.status(400).json({ success: false, error: 'Invalid webhook signature' })
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const event = payload.event
  const paymentEntity = payload.payload?.payment?.entity
  const orderEntity = payload.payload?.order?.entity
  const refundEntity = payload.payload?.refund?.entity

  console.log(`[Razorpay Webhook] Event received: ${event}`)

  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || refundEntity?.order_id
  const razorpayPaymentId = paymentEntity?.id || refundEntity?.payment_id
  const amount = Number(paymentEntity?.amount || orderEntity?.amount || refundEntity?.amount || 0) / 100
  const email = paymentEntity?.email || orderEntity?.email
  const phone = paymentEntity?.contact || orderEntity?.phone
  const method = paymentEntity?.method || 'razorpay'

  if (event === 'payment.captured' || event === 'order.paid') {
    if (razorpayOrderId) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('*')
        .or(`razorpay_order_id.eq.${razorpayOrderId},order_id.eq.${razorpayOrderId}`)
        .maybeSingle()

      if (order) {
        // Mark order as PAID strictly after payment.captured
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'PAID',
            status: 'paid',
            razorpay_payment_id: razorpayPaymentId || order.razorpay_payment_id,
            payment_method: method,
          })
          .eq('id', order.id)

        // Recalculate customer lifetime metrics
        await syncCustomerOnPayment({
          name: order.customer_name || email?.split('@')[0],
          email: order.customer_email || email,
          phone: order.customer_phone || phone,
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
          customer_name: order.customer_name,
          customer_email: order.customer_email || email,
          customer_phone: order.customer_phone || phone,
          webhook_event: event,
          raw_response: payload,
        })

        // Deliver digital asset receipt email
        try {
          const delivery = await createDelivery(order)
          await sendDeliveryEmail(order, delivery)
        } catch (err) {
          console.warn('[Webhook Delivery Warning]:', err.message)
        }
      }
    }
  } else if (event === 'payment.authorized') {
    await logPaymentAttempt({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      amount,
      status: 'authorized',
      payment_method: method,
      customer_email: email,
      customer_phone: phone,
      webhook_event: event,
      raw_response: payload,
    })
  } else if (event === 'payment.failed') {
    const errCode = paymentEntity?.error_code || 'BAD_REQUEST_PAYMENT_TIMED_OUT'
    const errDesc = paymentEntity?.error_description || paymentEntity?.error_reason || 'Customer - Payment Timed Out'

    await logPaymentAttempt({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      amount,
      status: 'failed',
      payment_method: method,
      gateway_error_code: errCode,
      gateway_error_description: errDesc,
      customer_email: email,
      customer_phone: phone,
      webhook_event: event,
      raw_response: payload,
    })
  } else if (event === 'refund.created' || event === 'refund.processed') {
    if (razorpayOrderId) {
      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'refunded', status: 'refunded' })
        .or(`razorpay_order_id.eq.${razorpayOrderId},order_id.eq.${razorpayOrderId}`)

      await logPaymentAttempt({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount,
        status: 'refunded',
        webhook_event: event,
        raw_response: payload,
      })
    }
  }

  return res.status(200).json({ success: true, event })
}
