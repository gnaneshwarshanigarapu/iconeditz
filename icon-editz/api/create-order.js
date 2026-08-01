import Razorpay from 'razorpay'
import { z } from 'zod'
import { authenticate } from './lib/auth.js'
import { supabaseAdmin } from './lib/supabaseAdmin.js'

const checkoutSchema = z.object({
  product_id: z.string().uuid(),
  customer_name: z.string().trim().min(1).max(120),
  customer_email: z.string().trim().email(),
  customer_phone: z.string().trim().min(7).max(20),
})

const errorResponse = (res, status, error) => res.status(status).json({
  success: false,
  error: error.message,
  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return errorResponse(res, 405, new Error('Method not allowed'))
    if (!req.headers.authorization?.match(/^Bearer\s+\S+/i)) return errorResponse(res, 401, new Error('Authorization header is required'))

    const parsed = checkoutSchema.safeParse(req.body)
    if (!parsed.success) return errorResponse(res, 400, new Error('Invalid checkout request'))
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return errorResponse(res, 500, new Error('Razorpay is not configured'))

    const user = await authenticate(req)
    if (!user?.sub) return errorResponse(res, 401, new Error('Invalid Supabase session'))

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id,title,price,discount_price,published,status')
      .eq('id', parsed.data.product_id)
      .is('deleted_at', null)
      .maybeSingle()
    if (productError) throw productError
    if (!product) return errorResponse(res, 404, new Error('Product not found'))
    if (!product.published || product.status !== 'published') return errorResponse(res, 400, new Error('Product is not published'))

    const amount = Math.round(Number(product.discount_price ?? product.price) * 100)
    if (!Number.isSafeInteger(amount) || amount < 100) return errorResponse(res, 400, new Error('The payment amount must be at least 100 paise'))

    const { data: databaseOrder, error: databaseError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.sub,
        product_id: product.id,
        product_name: product.title,
        customer_name: parsed.data.customer_name,
        customer_email: parsed.data.customer_email,
        amount: amount / 100,
        payment_status: 'pending',
        status: 'pending',
      })
      .select('id')
      .single()
    if (databaseError || !databaseOrder) throw databaseError || new Error('Unable to create the local order')

    console.info(JSON.stringify({ event: 'razorpay_order_create', productId: product.id, amount, userId: user.sub }))
    let razorpayOrder
    try {
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
      razorpayOrder = await razorpay.orders.create({ amount, currency: 'INR', receipt: databaseOrder.id, notes: { database_order_id: databaseOrder.id, product_id: product.id } })
    } catch (error) {
      await supabaseAdmin.from('orders').update({ status: 'payment_creation_failed' }).eq('id', databaseOrder.id).then(() => undefined).catch(() => undefined)
      throw new Error(`Razorpay order creation failed: ${error.message}`)
    }
    if (!razorpayOrder?.id) throw new Error('Razorpay returned an invalid order response')

    const { error: updateError } = await supabaseAdmin.from('orders').update({ order_id: razorpayOrder.id }).eq('id', databaseOrder.id)
    if (updateError) throw updateError
    return res.status(201).json({ success: true, order_id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency })
  } catch (error) {
    console.error('create-order failed', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}
