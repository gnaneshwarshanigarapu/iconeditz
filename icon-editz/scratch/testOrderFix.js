import dotenv from 'dotenv'
dotenv.config()
import { supabaseAdmin } from '../server/lib/supabaseAdmin.js'
import crypto from 'node:crypto'

async function test() {
  const localOrderId = crypto.randomUUID()
  console.log('Testing optimized order sequence with localOrderId:', localOrderId)

  // 1. Insert parent order record first
  const { error: orderErr } = await supabaseAdmin.from('orders').insert({
    id: localOrderId,
    product_id: 'edf8bb86-b687-4116-968f-3008dbc4667b',
    product_name: 'Luts',
    customer_name: 'Nani',
    customer_email: 'shanigarapugnaneshwar3@gmail.com',
    customer_phone: '9346084649',
    amount: 10,
    total_amount: 10,
    currency: 'INR',
    payment_status: 'pending',
    status: 'pending',
    payment_method: 'razorpay',
  })

  if (orderErr) throw orderErr
  console.log('Parent order created successfully.')

  // 2. Insert order items after parent order exists
  const { error: itemsErr } = await supabaseAdmin.from('order_items').insert([{
    order_id: localOrderId,
    product_id: 'edf8bb86-b687-4116-968f-3008dbc4667b',
    product_name: 'Luts',
    quantity: 1,
    unit_price: 10,
    total_price: 10,
  }])

  if (itemsErr) console.warn('Order items insert notice:', itemsErr.message)
  else console.log('Order items inserted successfully!')
}

test().catch(console.error)
