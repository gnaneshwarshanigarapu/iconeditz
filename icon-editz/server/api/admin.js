import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authorizeAdmin } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { getIpAddress } from '../lib/ip.js'
import { logPaymentAttempt } from '../lib/paymentAttemptLog.js'
import { syncCustomerOnPayment } from '../lib/customerSync.js'

const hash = (value) => value ? crypto.createHash('sha256').update(String(value).toLowerCase()).digest('hex') : undefined

const require = createRequire(import.meta.url)

let razorpayClient
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null
  if (!razorpayClient) {
    const Razorpay = require('razorpay')
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpayClient
}

/**
 * GET /api/admin — Full server-side aggregated dashboard metrics
 */
async function dashboard(req, res) {
  await authorizeAdmin(req)

  // Run all queries in parallel for speed
  const [
    { count: productCount, error: productError },
    { data: allOrders = [], error: orderError },
    { count: customerCount, error: customerError },
    { data: recentAttempts = [], error: attemptError },
  ] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('id, amount, total_amount, payment_status, status, customer_email, customer_name, customer_phone, user_email, email, razorpay_order_id, razorpay_payment_id, payment_method, product_name, created_at').order('created_at', { ascending: false }),
    supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('payment_attempts').select('id, status, amount, created_at').order('created_at', { ascending: false }).limit(500),
  ])

  if (productError) throw productError
  if (orderError) throw orderError

  // Strict server-side aggregation — only PAID orders count toward revenue
  const paidStatuses = new Set(['paid', 'success', 'captured'])
  const paidOrders = allOrders.filter((o) => paidStatuses.has((o.payment_status || o.status || '').toLowerCase()))
  const pendingOrders = allOrders.filter((o) => (o.payment_status || o.status || '').toLowerCase() === 'pending')
  const failedOrders = allOrders.filter((o) => (o.payment_status || o.status || '').toLowerCase() === 'failed')
  const refundedOrders = allOrders.filter((o) => (o.payment_status || o.status || '').toLowerCase() === 'refunded')

  const paidRevenue = paidOrders.reduce((sum, o) => sum + Number(o.amount || o.total_amount || 0), 0)
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + Number(o.amount || o.total_amount || 0), 0)

  // Distinct customer count from orders (fallback if customers table is empty)
  const uniqueEmails = new Set(
    allOrders.map((o) => (o.customer_email || o.user_email || o.email || '').trim().toLowerCase()).filter(Boolean)
  )

  // Payment attempt stats
  const capturedAttempts = recentAttempts.filter((a) => a.status === 'captured').length
  const failedAttempts = recentAttempts.filter((a) => a.status === 'failed').length

  // Latest 10 orders for recent transactions table
  const latestOrders = allOrders.slice(0, 10)

  // Today's metrics
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayOrders = allOrders.filter((o) => new Date(o.created_at) >= todayStart)
  const todayPaidOrders = todayOrders.filter((o) => paidStatuses.has((o.payment_status || o.status || '').toLowerCase()))
  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0)

  return res.json({
    success: true,
    data: {
      // Core metrics
      totalRevenue: paidRevenue,
      pendingRevenue,
      totalOrders: allOrders.length,
      paidOrders: paidOrders.length,
      pendingOrders: pendingOrders.length,
      failedOrders: failedOrders.length,
      refundedOrders: refundedOrders.length,
      totalProducts: productCount || 0,
      totalCustomers: customerCount || uniqueEmails.size || 0,

      // Payment attempt stats
      capturedAttempts,
      failedAttempts,
      totalAttempts: recentAttempts.length,

      // Today
      todayOrders: todayPaidOrders.length,
      todayRevenue,

      // Recent transactions
      latestOrders,

      // Timestamp
      syncedAt: new Date().toISOString(),
    },
  })
}

/**
 * PUT /api/admin — Razorpay Live Sync
 * Fetches live payment statuses from Razorpay API and reconciles with DB.
 */
async function razorpaySync(req, res) {
  await authorizeAdmin(req)

  const razorpay = getRazorpay()
  if (!razorpay) {
    return res.status(503).json({
      success: false,
      message: 'Razorpay API keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment.',
    })
  }

  // Fetch all orders that have a razorpay_order_id
  const { data: dbOrders = [], error } = await supabaseAdmin
    .from('orders')
    .select('id, razorpay_order_id, razorpay_payment_id, payment_status, status, amount, customer_name, customer_email, customer_phone, created_at')
    .not('razorpay_order_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error

  let synced = 0
  let updated = 0
  let failed = 0
  const syncResults = []

  for (const dbOrder of dbOrders) {
    const currentStatus = (dbOrder.payment_status || dbOrder.status || '').toLowerCase()

    // Skip already-refunded orders (final state)
    if (currentStatus === 'refunded') {
      synced++
      continue
    }

    try {
      // Fetch live order from Razorpay
      const rzpOrder = await razorpay.orders.fetch(dbOrder.razorpay_order_id)

      let newPaymentStatus = null
      let newStatus = null
      let razorpayPaymentId = dbOrder.razorpay_payment_id

      // Map Razorpay order status to our DB status
      if (rzpOrder.status === 'paid' && currentStatus !== 'paid') {
        newPaymentStatus = 'PAID'
        newStatus = 'paid'

        // Fetch the payment for this order to get payment ID
        try {
          const payments = await razorpay.orders.fetchPayments(dbOrder.razorpay_order_id)
          const capturedPayment = (payments?.items || []).find((p) => p.status === 'captured')
          if (capturedPayment) {
            razorpayPaymentId = capturedPayment.id
          }
        } catch { /* payment fetch is best-effort */ }

      } else if (rzpOrder.status === 'attempted' && currentStatus === 'pending') {
        // Order was attempted but not paid — mark as failed
        newPaymentStatus = 'failed'
        newStatus = 'failed'
      }
      // 'created' status in Razorpay = pending in our system, no change needed

      if (newPaymentStatus && newPaymentStatus.toLowerCase() !== currentStatus) {
        const updatePayload = {
          payment_status: newPaymentStatus,
          status: newStatus,
        }
        if (razorpayPaymentId) updatePayload.razorpay_payment_id = razorpayPaymentId

        await supabaseAdmin
          .from('orders')
          .update(updatePayload)
          .eq('id', dbOrder.id)

        // If newly marked as PAID, sync customer LTV
        if (newPaymentStatus === 'PAID') {
          await syncCustomerOnPayment({
            name: dbOrder.customer_name,
            email: dbOrder.customer_email,
            phone: dbOrder.customer_phone,
          })
        }

        // Log the sync event as a payment attempt
        await logPaymentAttempt({
          order_id: dbOrder.id,
          razorpay_order_id: dbOrder.razorpay_order_id,
          razorpay_payment_id: razorpayPaymentId,
          amount: dbOrder.amount,
          currency: 'INR',
          status: newPaymentStatus.toLowerCase() === 'paid' ? 'captured' : newPaymentStatus.toLowerCase(),
          customer_name: dbOrder.customer_name,
          customer_email: dbOrder.customer_email,
          customer_phone: dbOrder.customer_phone,
          webhook_event: `admin.sync.${rzpOrder.status}`,
          raw_response: rzpOrder,
        }).catch(() => {})

        updated++
        syncResults.push({
          orderId: dbOrder.id.slice(0, 8),
          razorpayOrderId: dbOrder.razorpay_order_id,
          previousStatus: currentStatus,
          newStatus: newPaymentStatus,
          razorpayStatus: rzpOrder.status,
        })
      }

      synced++
    } catch (err) {
      failed++
      console.error(`[Razorpay Sync] Failed for order ${dbOrder.id}:`, err.message)
    }
  }

  return res.json({
    success: true,
    data: {
      totalProcessed: dbOrders.length,
      synced,
      updated,
      failed,
      results: syncResults,
      syncedAt: new Date().toISOString(),
    },
  })
}

/**
 * POST /api/admin — Meta CAPI analytics event
 */
async function analytics(req, res) {
  const { eventName, eventData, fbp, fbc, externalId, email, phone } = req.body || {}
  if (!eventName) throw Object.assign(new Error('eventName is required'), { status: 400 })
  console.info('Meta CAPI Event:', { event_name: eventName, event_time: Math.floor(Date.now() / 1000), user_data: { client_ip_address: getIpAddress(req), client_user_agent: req.headers['user-agent'], fbp, fbc, external_id: externalId, em: hash(email), ph: hash(phone) }, custom_data: eventData, event_source_url: req.headers.referer, action_source: 'website' })
  return res.json({ success: true })
}

export default withApi({ GET: dashboard, POST: analytics, PUT: razorpaySync })
