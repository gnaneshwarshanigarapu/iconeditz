import dotenv from 'dotenv'
import { getSupabaseAdmin } from '../server/lib/supabaseAdmin.js'

dotenv.config({ path: '.env' })

;(async () => {
  console.log('Seeding failed payment into orders table...')
  const supabase = getSupabaseAdmin()

  const payload = {
    order_id: 'order_TMZ5IJbrJ2dj07',
    product_name: 'SFX Pack for Editors',
    customer_name: 'Nani',
    customer_email: 'nani@gmail.com',
    customer_phone: '+91 9346 084649',
    amount: 99.00,
    payment_status: 'FAILED',
    status: 'failed',
    razorpay_payment_id: 'pay_TMZ5IJbrJ2dj07',
    created_at: '2026-08-06T22:52:00.000Z',
    updated_at: '2026-08-06T22:52:00.000Z',
  }

  const { data, error } = await supabase.from('orders').insert([payload]).select()
  if (error) {
    console.error('Seed order warning:', error.message)
  } else {
    console.log('✓ Successfully recorded failed payment attempt in database orders:', data)
  }
})()
