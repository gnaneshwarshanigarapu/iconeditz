import { tryAuthenticate } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { createDelivery } from '../lib/delivery.js'
import { getIpAddress } from '../lib/ip.js'

async function getDownload(req, res) {
  const user = await tryAuthenticate(req)
  const orderId = req.query?.orderId || req.body?.orderId

  if (!orderId) {
    throw Object.assign(new Error('orderId is required'), { status: 400 })
  }

  console.log(`[File Delivery] Requesting fresh download link for order ID: ${orderId}...`)

  const normalizedOrderId = String(orderId).trim()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedOrderId)
  const filter = isUuid
    ? `id.eq.${normalizedOrderId},razorpay_order_id.eq.${normalizedOrderId},order_id.eq.${normalizedOrderId}`
    : `razorpay_order_id.eq.${normalizedOrderId},order_id.eq.${normalizedOrderId}`

  const { data: orderList, error } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,product_id,product_name,amount,payment_status,customer_email,products(download_key,download_filename)')
    .or(filter)

  if (error) throw error
  const order = orderList && orderList.length > 0 ? orderList[0] : null
  if (!order) {
    console.error(`[File Delivery] Order ${orderId} not found`)
    throw Object.assign(new Error('Order not found'), { status: 404 })
  }

  if (order.payment_status !== 'PAID' && order.status !== 'paid') {
    console.error(`[File Delivery] Download denied: Order ${orderId} status is ${order.payment_status}`)
    throw Object.assign(new Error('Download is not authorized. Payment is pending or unconfirmed.'), { status: 403 })
  }

  // Authorization check: if authenticated user, ensure they own the order or are admin
  if (user && user.role !== 'admin' && order.user_id && order.user_id !== user.sub) {
    console.error(`[File Delivery] Download denied for user ${user.email} on order ${orderId}`)
    throw Object.assign(new Error('You are not authorized to access this download.'), { status: 403 })
  }

  const delivery = await createDelivery(order)
  console.log(`[File Delivery] Signed URL generated successfully for order ${orderId}`)

  await supabaseAdmin.from('download_logs').insert({
    user_id: order.user_id || user?.sub || null,
    product_id: order.product_id,
    order_id: order.id,
    ip_address: getIpAddress(req),
    download_count: 1,
  }).catch(() => {})

  return res.json({
    success: true,
    downloadUrl: delivery.downloadUrl,
    expiresAt: delivery.expiresAt,
    orderId: order.id,
    product: order.product_name,
  })
}

export default withApi({ GET: getDownload, POST: getDownload })
