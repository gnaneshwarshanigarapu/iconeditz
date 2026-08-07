import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { z } from 'zod'
import { authenticate, tryAuthenticate } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { createDelivery, sendDeliveryEmail } from '../lib/delivery.js'
import { sendMetaPurchase } from '../lib/metaCapi.js'
import { syncCustomerOnPayment } from '../lib/customerSync.js'
import { logPaymentAttempt } from '../lib/paymentAttemptLog.js'

const checkoutSchema = z.object({
  productId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
  })).optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(20),
})

const verificationSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

const httpError = (message, status, step) => Object.assign(new Error(message), { status, step })

const require = createRequire(import.meta.url)
const Razorpay = require('razorpay')
let razorpayClient

const getRazorpay = () => {
  const keyIdPresent = Boolean(process.env.RAZORPAY_KEY_ID)
  const secretPresent = Boolean(process.env.RAZORPAY_KEY_SECRET)
  if (!keyIdPresent || !secretPresent) {
    throw httpError('Payment service temporarily unavailable: Missing Razorpay API keys', 503, 'environment_audit')
  }
  razorpayClient ||= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  return razorpayClient
}

async function listOrders(req, res) {
  const user = await authenticate(req)
  const singleOrderId = req.query.id

  if (singleOrderId) {
    // Single order details with SQL joins
    const { data: singleOrder, error: singleErr } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(*)), customers(*)')
      .eq('id', singleOrderId)
      .maybeSingle()

    if (singleErr) throw singleErr
    if (!singleOrder) return res.status(404).json({ success: false, message: 'Order not found' })
    return res.json({ success: true, data: singleOrder, order: singleOrder })
  }

  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(*)), products(*)')
    .order('created_at', { ascending: false })

  if (user.role !== 'admin') {
    query = query.eq('user_id', user.sub)
  }

  const { data, error } = await query
  if (error) throw error

  // Format order items with product titles from SQL join
  const formatted = (data || []).map((o) => {
    let items = o.order_items || []
    if (items.length === 0 && (o.product_name || o.products?.title)) {
      items = [
        {
          id: o.id,
          product_id: o.product_id || o.products?.id,
          product_name: o.products?.title || o.product_name || 'Creative Asset',
          quantity: 1,
          unit_price: Number(o.amount || 0),
          total_price: Number(o.amount || 0),
          products: o.products || null,
        },
      ]
    }

    return {
      ...o,
      order_items: items,
      customer_email: o.customer_email || o.user_email || o.email || '',
      customer_name: o.customer_name || o.name || 'Customer',
      customer_phone: o.customer_phone || o.phone || '',
      payment_status: o.payment_status || o.status || 'PAID',
    }
  })

  return res.json({ success: true, data: formatted, orders: formatted })
}

async function createOrder(req, res) {
  const apiStart = Date.now()
  let currentStep = 'initialization'

  const stepTimer = (stepName) => {
    const start = Date.now()
    return () => {
      const duration = Date.now() - start
      console.log(`[POST /api/orders] Step '${stepName}' completed in ${duration}ms`)
      return duration
    }
  }

  try {
    // Step 1: Validation
    currentStep = 'request_validation'
    const endValTimer = stepTimer('request_validation')
    const user = await tryAuthenticate(req)

    const rawBody = req.body || {}
    const customer_name = (rawBody.customer_name || rawBody.name || '').trim()
    const customer_email = (rawBody.customer_email || rawBody.email || '').trim().toLowerCase()
    const customer_phone = (rawBody.customer_phone || rawBody.phone || '').trim()
    const product_id = rawBody.product_id || rawBody.productId
    const rawItems = rawBody.items

    if (!customer_name) throw httpError('Customer name is required', 400, 'request_validation')
    if (!customer_email || !customer_email.includes('@')) throw httpError('Valid customer email is required', 400, 'request_validation')
    if (!customer_phone || customer_phone.length < 7) throw httpError('Valid mobile phone number is required', 400, 'request_validation')

    const itemsToFetch = rawItems && rawItems.length > 0
      ? rawItems
      : product_id
      ? [{ productId: product_id, quantity: 1 }]
      : []

    if (itemsToFetch.length === 0) throw httpError('No valid product selected for order', 400, 'request_validation')
    endValTimer()

    // Step 2: Environment Audit
    currentStep = 'environment_audit'
    const endEnvTimer = stepTimer('environment_audit')
    const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
    const missingEnv = requiredEnv.filter((key) => !process.env[key])
    if (missingEnv.length > 0) {
      console.error(`[POST /api/orders Environment Error] Missing required variables: ${missingEnv.join(', ')}`)
      throw httpError(`Payment service misconfigured. Missing environment variables: ${missingEnv.join(', ')}`, 503, 'environment_audit')
    }
    const razorpay = getRazorpay()
    endEnvTimer()

    // Step 3: Database Lookup
    currentStep = 'database_lookup'
    const endDbLookupTimer = stepTimer('database_lookup')
    const productIds = itemsToFetch.map((i) => i.productId || i.product_id)

    const { data: dbProducts, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id,title,slug,category,price,discount_price')
      .in('id', productIds)

    if (prodErr) {
      console.error('[POST /api/orders DB Lookup Error]', prodErr.message)
      throw httpError(`Failed to query product database: ${prodErr.message}`, 500, 'database_lookup')
    }
    if (!dbProducts || dbProducts.length === 0) {
      throw httpError('Selected product not found in database', 404, 'database_lookup')
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))
    let totalAmountPaise = 0
    const orderItemsData = []

    for (const item of itemsToFetch) {
      const targetId = item.productId || item.product_id
      const prod = productMap.get(targetId)
      if (!prod) continue
      const unitPrice = Number(prod.discount_price ?? prod.price)
      const lineTotalPaise = Math.round(unitPrice * 100) * item.quantity
      totalAmountPaise += lineTotalPaise

      orderItemsData.push({
        product_id: prod.id,
        product_name: prod.title,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
      })
    }

    if (!totalAmountPaise || totalAmountPaise < 100) {
      throw httpError('The total payment amount must be at least ₹1 (100 paise)', 400, 'database_lookup')
    }
    endDbLookupTimer()

    // Step 4: Prepare Local Order ID & Notes
    currentStep = 'razorpay_request'
    const localOrderId = crypto.randomUUID()
    const firstProduct = dbProducts[0] || {}
    const firstProdName = orderItemsData[0]?.product_name || firstProduct.title || 'Creative Asset'
    const couponCode = rawBody.couponCode || rawBody.coupon || 'none'

    const notes = {
      customer_name,
      customer_email,
      customer_phone,
      product_id: String(firstProduct.id || product_id || ''),
      product_name: String(firstProdName).substring(0, 100),
      product_slug: String(firstProduct.slug || 'n-a'),
      product_category: String(firstProduct.category || 'digital_asset'),
      local_order_id: String(localOrderId),
      coupon_code: String(couponCode),
      payment_type: 'digital_asset',
      storage_provider: String(process.env.STORAGE_PROVIDER || 'supabase'),
      website: 'icon-editz.com',
      created_by: 'website_checkout',
    }

    // Step 5: Razorpay Order Creation Request First
    const endRzpTimer = stepTimer('razorpay_request')
    let razorpayOrder
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmountPaise,
        currency: 'INR',
        receipt: localOrderId,
        notes,
      })
      console.log("Creating pending order", razorpayOrder.id)
    } catch (rzpErr) {
      console.error('[POST /api/orders Razorpay Error]', rzpErr.message || rzpErr)
      throw httpError(rzpErr.message || 'Payment gateway order creation failed', 502, 'razorpay_request')
    }

    if (!razorpayOrder?.id) {
      throw httpError('Razorpay returned an invalid order response', 502, 'razorpay_request')
    }
    endRzpTimer()

    // Step 6: Single-Step Awaited Supabase Pending Order Insertion (Contains razorpay_order_id upfront)
    currentStep = 'database_insert'
    const endDbInsertTimer = stepTimer('database_insert')
    const { data: databaseOrder, error: databaseError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: localOrderId,
        razorpay_order_id: razorpayOrder.id,
        order_id: razorpayOrder.id,
        user_id: user?.sub || null,
        product_id: orderItemsData[0]?.product_id || null,
        product_name: firstProdName,
        customer_name,
        customer_email,
        customer_phone,
        amount: totalAmountPaise / 100,
        total_amount: totalAmountPaise / 100,
        currency: 'INR',
        payment_status: 'pending',
        status: 'pending',
        payment_method: 'razorpay',
      })
      .select('id, razorpay_order_id, customer_email, amount, status')
      .single()

    if (databaseError || !databaseOrder) {
      console.error("Supabase insert failed", databaseError)
      throw httpError(databaseError?.message || 'Database order creation failed', 500, 'database_insert')
    }

    console.log("Inserted pending order", databaseOrder)
    endDbInsertTimer()

    // Step 7: Async Order Items & Background Sync
    const itemsWithOrderId = orderItemsData.map((item) => ({ ...item, order_id: localOrderId }))
    Promise.resolve(supabaseAdmin.from('order_items').insert(itemsWithOrderId))
      .catch((err) => console.warn('[POST /api/orders] Order items insert notice:', err.message))

    syncCustomerOnPayment({ name: customer_name, email: customer_email, phone: customer_phone }).catch(() => {})
    logPaymentAttempt({
      order_id: localOrderId,
      razorpay_order_id: razorpayOrder.id,
      amount: totalAmountPaise / 100,
      currency: 'INR',
      status: 'initiated',
      customer_name,
      customer_email,
      customer_phone,
      webhook_event: 'order.created',
    }).catch(() => {})

    const totalDuration = Date.now() - apiStart
    console.log(`[POST /api/orders] SUCCESS: Created & Inserted Pending Order ${razorpayOrder.id} in ${totalDuration}ms`)

    return res.status(201).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order_id: razorpayOrder.id,
      local_order_id: localOrderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      step: 'order_creation_success',
      durationMs: totalDuration,
    })
  } catch (err) {
    console.error(`[POST /api/orders Failure] Step '${currentStep}' failed:`, err.message || err)
    err.step = err.step || currentStep
    throw err
  }
}

async function verifyPayment(req, res) {
  const user = await tryAuthenticate(req)
  const parsed = verificationSchema.safeParse(req.body)
  if (!parsed.success) throw httpError('Missing or invalid payment verification fields', 400, 'request_validation')
  const input = parsed.data
  const secret = process.env.RAZORPAY_KEY_SECRET
  const razorpay = getRazorpay()

  const normalizedRazorpayOrderId = String(input.razorpay_order_id || '').trim()
  console.log(`[PUT /api/orders/verify] Incoming request: razorpay_order_id=${normalizedRazorpayOrderId}, razorpay_payment_id=${input.razorpay_payment_id}`)

  // 1. Instant HMAC SHA256 Signature Verification
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${normalizedRazorpayOrderId}|${input.razorpay_payment_id}`)
    .digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(input.razorpay_signature, 'utf8')
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    console.error(`[Payment Verification] Signature verification FAILED for order ${normalizedRazorpayOrderId}`)
    logPaymentAttempt({
      razorpay_order_id: normalizedRazorpayOrderId,
      razorpay_payment_id: input.razorpay_payment_id,
      status: 'failed',
      gateway_error_code: 'BAD_SIGNATURE',
      gateway_error_description: 'HMAC SHA256 signature verification failed',
      webhook_event: 'payment.failed',
    }).catch(() => {})
    throw httpError('Invalid payment signature', 400, 'signature_verification')
  }

  // 2. Fetch Razorpay Payment details for validation and fallback metadata
  let payment
  try {
    payment = await razorpay.payments.fetch(input.razorpay_payment_id)
    console.log(`[Payment Verification] Fetched Razorpay payment ${payment.id}, status=${payment.status}, amount=${payment.amount}`)
  } catch (err) {
    console.error(`[Payment Verification] Failed to fetch Razorpay payment ${input.razorpay_payment_id}:`, err.message)
    throw httpError('Failed to fetch payment details from Razorpay', 502, 'razorpay_payment_fetch')
  }

  // 3. Search Database Order strictly by razorpay_order_id
  console.log(`[Payment Verification] Searching order where razorpay_order_id = ${normalizedRazorpayOrderId}`)
  const { data: orderList, error: orderErr } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,product_id,product_name,customer_name,customer_email,customer_phone,amount,payment_status,products(download_key,download_filename)')
    .or(`razorpay_order_id.eq.${normalizedRazorpayOrderId},order_id.eq.${normalizedRazorpayOrderId},id.eq.${normalizedRazorpayOrderId}`)

  let order = orderList && orderList.length > 0 ? orderList[0] : null
  let rowsReturned = orderList ? orderList.length : 0

  // Fallback search using local_order_id from Razorpay payment notes if initial lookup returned 0 rows
  if (!order && payment.notes?.local_order_id) {
    const targetLocalOrderId = String(payment.notes.local_order_id).trim()
    console.log(`[Payment Verification] Initial lookup empty. Retrying lookup using payment.notes.local_order_id = ${targetLocalOrderId}`)
    const { data: fallbackList } = await supabaseAdmin
      .from('orders')
      .select('id,user_id,product_id,product_name,customer_name,customer_email,customer_phone,amount,payment_status,products(download_key,download_filename)')
      .eq('id', targetLocalOrderId)

    if (fallbackList && fallbackList.length > 0) {
      order = fallbackList[0]
      rowsReturned = fallbackList.length
      Promise.resolve(
        supabaseAdmin.from('orders').update({ razorpay_order_id: normalizedRazorpayOrderId, order_id: normalizedRazorpayOrderId }).eq('id', order.id)
      ).catch(() => {})
    }
  }

  if (orderErr || !order) {
    console.error('[Order Verification Failure] Detailed Diagnostic Summary:', {
      received_razorpay_order_id: normalizedRazorpayOrderId,
      received_razorpay_payment_id: input.razorpay_payment_id,
      sql_filter_used: `razorpay_order_id = '${normalizedRazorpayOrderId}'`,
      number_of_rows_returned: rowsReturned,
      available_database_columns: ['id', 'razorpay_order_id', 'order_id', 'product_id', 'product_name', 'customer_name', 'customer_email', 'customer_phone', 'amount', 'currency', 'status', 'payment_status', 'created_at'],
      db_error: orderErr?.message || null,
      exact_reason: 'No matching record exists in Supabase orders table for razorpay_order_id',
    })
    throw httpError(`Order not found. (Searched razorpay_order_id: ${normalizedRazorpayOrderId})`, 404, 'order_lookup')
  }

  console.log(`[Order Verification] Order FOUND: ID=${order.id}, customer=${order.customer_email}, current_status=${order.payment_status}`)

  if (
    payment.order_id !== normalizedRazorpayOrderId ||
    payment.currency !== 'INR' ||
    payment.amount !== Math.round(Number(order.amount) * 100) ||
    payment.status !== 'captured'
  ) {
    console.error(`[Payment Verification] Payment mismatch: rzp_order=${payment.order_id}, rzp_amount=${payment.amount}, expected_amount=${Math.round(Number(order.amount) * 100)}, status=${payment.status}`)
    throw httpError('Payment details do not match the order', 400, 'payment_validation')
  }

  // 4. Update Order to PAID + Generate Signed Download URL
  console.log(`[Order Verification] Updating order ${order.id} payment_status to PAID...`)
  const [delivery, updateRes] = await Promise.all([
    createDelivery(order),
    supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'PAID',
        status: 'paid',
        razorpay_payment_id: input.razorpay_payment_id,
        razorpay_signature: input.razorpay_signature,
        payment_method: payment.method || 'razorpay',
      })
      .eq('id', order.id),
  ])

  if (updateRes.error) {
    console.error(`[Order Update Error] Failed to update order status:`, updateRes.error.message)
  } else {
    console.log(`[Order Update Success] Order ${order.id} updated to PAID with payment ${input.razorpay_payment_id}`)
  }

  // 5. Non-blocking Background Tasks
  syncCustomerOnPayment({
    name: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
  }).catch(() => {})

  Promise.resolve(
    supabaseAdmin.from('download_logs').insert({
      user_id: order.user_id,
      product_id: order.product_id,
      order_id: order.id,
      ip_address: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1',
      download_count: 0,
    })
  ).catch((err) => console.warn('[Payment Verification] Download log notice:', err.message))

  logPaymentAttempt({
    order_id: order.id,
    razorpay_order_id: input.razorpay_order_id,
    razorpay_payment_id: input.razorpay_payment_id,
    amount: order.amount,
    currency: 'INR',
    status: 'captured',
    payment_method: payment.method || 'razorpay',
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    webhook_event: 'payment.captured',
    raw_response: payment,
  }).catch(() => {})

  // 6. Background Email Dispatch (Strictly when RESEND_ENABLED === 'true')
  if (process.env.RESEND_ENABLED === 'true') {
    sendDeliveryEmail(order, delivery)
      .then(() => {
        Promise.resolve(supabaseAdmin.from('orders').update({ email_status: 'sent' }).eq('id', order.id)).catch(() => {})
      })
      .catch((err) => {
        Promise.resolve(supabaseAdmin.from('orders').update({ email_status: `failed: ${err.message}` }).eq('id', order.id)).catch(() => {})
      })
  }

  // 7. Return payload immediately
  const eventId = `purchase_${order.id}`
  sendMetaPurchase(req, order, eventId).catch(() => {})

  console.log(`[PUT /api/orders/verify] SUCCESS: Payment verified for order ${order.id}. Download URL generated: ${Boolean(delivery?.downloadUrl)}`)

  return res.json({
    success: true,
    downloadUrl: delivery?.downloadUrl || null,
    expiresAt: delivery?.expiresAt || null,
    orderId: order.id,
    product: order.product_name,
    amount: order.amount,
    eventId,
    message: 'Payment verified successfully',
  })
}

export default withApi({ GET: listOrders, POST: createOrder, PUT: verifyPayment })
