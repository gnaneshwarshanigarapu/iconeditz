import { authenticate } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { createDelivery } from '../lib/delivery.js'
import { getIpAddress } from '../lib/ip.js'

async function createDownload(req, res) {
  const user = await authenticate(req)
  const { orderId } = req.body || {}
  if (!orderId) throw Object.assign(new Error('orderId is required'), { status: 400 })
  const { data: order, error } = await supabaseAdmin.from('orders').select('id,user_id,product_id,product_name,amount,payment_status,products(download_key,download_filename)').eq('id', orderId).maybeSingle()
  if (error) throw error
  if (!order || order.payment_status !== 'PAID' || (user.role !== 'admin' && order.user_id !== user.sub)) throw Object.assign(new Error('Download is not authorized'), { status: 403 })
  const delivery = await createDelivery(order)
  await supabaseAdmin.from('download_logs').insert({ user_id: order.user_id, product_id: order.product_id, order_id: order.id, ip_address: getIpAddress(req), download_count: 1 })
  return res.json({ success: true, ...delivery })
}
export default withApi({ POST: createDownload })
