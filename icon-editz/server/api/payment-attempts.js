import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authorizeAdmin } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'

async function listPaymentAttempts(req, res) {
  await authorizeAdmin(req)

  // 1. Try reading from payment_attempts table
  const { data: attemptRows, error } = await supabaseAdmin
    .from('payment_attempts')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && Array.isArray(attemptRows) && attemptRows.length > 0) {
    const formatted = attemptRows.map((att) => ({
      ...att,
      id: att.id,
      orderId: att.order_id || att.razorpay_order_id || 'N/A',
      customerEmail: att.customer_email || 'Anonymous',
      customerName: att.customer_name || 'Customer',
      amount: Number(att.amount || 0),
      currency: att.currency || 'INR',
      status: att.status || 'initiated',
      errorReason: att.error_description || att.error_code || 'GATEWAY_DROPPED',
      createdAt: att.created_at,
    }))
    return res.json({ success: true, data: formatted, attempts: formatted })
  }

  // 2. Fallback: Query live pending/failed/draft orders directly from orders table
  const { data: orders = [] } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const liveAttempts = orders.map((o) => ({
    id: o.id,
    orderId: o.razorpay_order_id || o.order_id || o.id,
    customerEmail: o.customer_email || o.user_email || o.email || '',
    customerName: o.customer_name || 'Customer',
    amount: Number(o.amount || 0),
    currency: o.currency || 'INR',
    status: (o.payment_status || o.status || 'pending').toLowerCase() === 'paid' ? 'captured' : 'pending',
    errorReason: (o.payment_status || o.status || 'pending').toLowerCase() === 'paid' ? 'SUCCESS' : 'CHECKOUT_PENDING',
    createdAt: o.created_at,
  }))

  return res.json({ success: true, data: liveAttempts, attempts: liveAttempts })
}

export default withApi(['GET'], listPaymentAttempts)
