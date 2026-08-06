import { supabaseAdmin } from './supabaseAdmin.js'

/**
 * Logs a payment attempt (initiated, captured, failed, refunded) to payment_attempts table.
 */
export async function logPaymentAttempt({
  order_id,
  razorpay_order_id,
  razorpay_payment_id,
  amount,
  currency = 'INR',
  status = 'initiated',
  payment_method = 'razorpay',
  customer_name,
  customer_email,
  customer_phone,
  error_code,
  error_description,
  raw_response,
}) {
  try {
    const payload = {
      order_id: order_id || null,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      amount: Number(amount || 0),
      currency: currency || 'INR',
      status: status || 'initiated',
      payment_method: payment_method || 'razorpay',
      customer_name: customer_name || null,
      customer_email: customer_email ? customer_email.trim().toLowerCase() : null,
      customer_phone: customer_phone || null,
      error_code: error_code || null,
      error_description: error_description || null,
      raw_response: raw_response || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('payment_attempts')
      .insert([payload])
      .select()
      .maybeSingle()

    if (error) {
      console.warn('Payment attempt log warning (table schema notice):', error.message)
    }

    return data || payload
  } catch (err) {
    console.error('Payment attempt log exception:', err.message)
    return null
  }
}
