import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authorizeAdmin } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { logPaymentAttempt } from '../lib/paymentAttemptLog.js'

async function listPaymentAttempts(req, res) {
  await authorizeAdmin(req)

  const { data: attemptRows, error } = await supabaseAdmin
    .from('payment_attempts')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && Array.isArray(attemptRows) && attemptRows.length > 0) {
    const formatted = attemptRows.map((att) => ({
      ...att,
      id: att.id,
      paymentId: att.razorpay_payment_id || att.id,
      orderId: att.razorpay_order_id || att.order_id || 'N/A',
      customerName: att.customer_name || 'Customer',
      customerEmail: att.customer_email || 'Anonymous',
      customerPhone: att.customer_phone || '',
      amount: Number(att.amount || 0),
      currency: att.currency || 'INR',
      status: att.status || 'failed',
      paymentMethod: att.payment_method || 'UPI',
      gatewayErrorCode: att.gateway_error_code || 'BAD_REQUEST_PAYMENT_TIMED_OUT',
      gatewayErrorDescription: att.gateway_error_description || 'Customer - Payment Timed Out',
      webhookEvent: att.webhook_event || (att.status === 'captured' ? 'payment.captured' : 'payment.failed'),
      retryCount: Number(att.retry_count || 1),
      recoveryEmailSent: Boolean(att.recovery_email_sent),
      createdAt: att.created_at,
    }))
    return res.json({ success: true, data: formatted, attempts: formatted })
  }

  // Fallback query from orders table for failed/pending attempts
  const { data: orders = [] } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const liveAttempts = orders.map((o) => {
    const isPaid = (o.payment_status || o.status || '').toUpperCase() === 'PAID'

    return {
      id: o.id,
      paymentId: o.razorpay_payment_id || `pay_${o.id.slice(0, 8)}`,
      orderId: o.razorpay_order_id || o.order_id || o.id,
      customerName: o.customer_name || 'Customer',
      customerEmail: o.customer_email || o.user_email || o.email || '',
      customerPhone: o.customer_phone || '',
      amount: Number(o.amount || 0),
      currency: o.currency || 'INR',
      status: isPaid ? 'captured' : 'failed',
      paymentMethod: o.payment_method || 'UPI',
      gatewayErrorCode: isPaid ? 'SUCCESS' : 'BAD_REQUEST_PAYMENT_TIMED_OUT',
      gatewayErrorDescription: isPaid ? 'Payment Captured' : 'Customer - Payment Timed Out',
      webhookEvent: isPaid ? 'payment.captured' : 'payment.failed',
      retryCount: 1,
      recoveryEmailSent: false,
      createdAt: o.created_at,
    }
  })

  return res.json({ success: true, data: liveAttempts, attempts: liveAttempts })
}

async function recordPaymentAttempt(req, res) {
  const {
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    amount,
    currency,
    status,
    payment_method,
    customer_name,
    customer_email,
    customer_phone,
    gateway_error_code,
    gateway_error_description,
    webhook_event,
    retry_count,
    raw_response,
  } = req.body || {}

  const result = await logPaymentAttempt({
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    amount,
    currency: currency || 'INR',
    status: status || 'failed',
    payment_method: payment_method || 'UPI',
    customer_name,
    customer_email,
    customer_phone,
    gateway_error_code: gateway_error_code || 'BAD_REQUEST_PAYMENT_TIMED_OUT',
    gateway_error_description: gateway_error_description || 'Customer - Payment Timed Out',
    webhook_event: webhook_event || 'payment.failed',
    retry_count: retry_count || 1,
    raw_response: raw_response || {},
  })

  return res.status(201).json({ success: true, data: result })
}

export default withApi({ GET: listPaymentAttempts, POST: recordPaymentAttempt })
