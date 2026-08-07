import dotenv from 'dotenv'
dotenv.config()
import { supabaseAdmin } from '../server/lib/supabaseAdmin.js'
import crypto from 'node:crypto'

async function test() {
  const localOrderId = crypto.randomUUID()
  console.log('Testing parallel inserts with localOrderId:', localOrderId)
  const [orderRes, itemsRes] = await Promise.all([
    supabaseAdmin.from('orders').insert({
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
    }),
    supabaseAdmin.from('order_items').insert([{
      order_id: localOrderId,
      product_id: 'edf8bb86-b687-4116-968f-3008dbc4667b',
      product_name: 'Luts',
      quantity: 1,
      unit_price: 10,
      total_price: 10,
    }]),
  ])
  console.log('ORDER RES:', orderRes)
  console.log('ITEMS RES:', itemsRes)
}

test().catch(console.error)
