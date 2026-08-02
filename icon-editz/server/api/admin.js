import crypto from 'node:crypto'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authorizeAdmin } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'
import { getIpAddress } from '../lib/ip.js'

const hash = (value) => value ? crypto.createHash('sha256').update(String(value).toLowerCase()).digest('hex') : undefined

async function dashboard(req, res) {
  await authorizeAdmin(req)
  const [{ count: products, error: productError }, { count: orders, error: orderError }, { data: recentProducts, error: recentError }] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*').order('created_at', { ascending: false }).limit(5),
  ])
  if (productError || orderError || recentError) throw productError || orderError || recentError
  return res.json({ success: true, data: { products, orders, recentProducts } })
}

async function analytics(req, res) {
  const { eventName, eventData, fbp, fbc, externalId, email, phone } = req.body || {}
  if (!eventName) throw Object.assign(new Error('eventName is required'), { status: 400 })
  console.info('Meta CAPI Event:', { event_name: eventName, event_time: Math.floor(Date.now() / 1000), user_data: { client_ip_address: getIpAddress(req), client_user_agent: req.headers['user-agent'], fbp, fbc, external_id: externalId, em: hash(email), ph: hash(phone) }, custom_data: eventData, event_source_url: req.headers.referer, action_source: 'website' })
  return res.json({ success: true })
}

export default withApi({ GET: dashboard, POST: analytics })
