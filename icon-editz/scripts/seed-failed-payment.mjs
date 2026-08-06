import dotenv from 'dotenv'
import { getSupabaseAdmin } from '../server/lib/supabaseAdmin.js'

dotenv.config({ path: '.env' })

;(async () => {
  console.log('Seeding failed payment attempt into Supabase...')
  const supabase = getSupabaseAdmin()

  const payload = {
    razorpay_payment_id: 'pay_TMZ5IJbrJ2dj07',
    amount: 99.00,
    currency: 'INR',
    status: 'failed',
    payment_method: 'UPI',
    customer_name: 'Nani',
    customer_email: 'nani@gmail.com',
    customer_phone: '+91 9346 084649',
    error_code: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
    error_description: 'Customer - Payment Timed Out',
    raw_response: {
      event: 'payment.failed',
      payment_id: 'pay_TMZ5IJbrJ2dj07',
      status: 'failed',
      error_code: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
      error_description: 'Customer - Payment Timed Out',
    },
    created_at: '2026-08-06T22:52:00.000Z',
    updated_at: '2026-08-06T22:52:00.000Z',
  }

  const { data, error } = await supabase.from('payment_attempts').insert([payload]).select()
  if (error) {
    console.error('Seed payment attempt warning:', error.message)
  } else {
    console.log('✓ Successfully seeded failed payment attempt:', data)
  }
})()
