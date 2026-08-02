import crypto from 'node:crypto'
import { getIpAddress } from './ip.js'

const hash = (value) => value ? crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex') : undefined

export async function sendMetaPurchase(req, order, eventId) {
  if (!process.env.META_PIXEL_ID || !process.env.META_CAPI_ACCESS_TOKEN) return
  const user_data = {
    em: hash(order.customer_email), ph: hash(order.customer_phone),
    client_ip_address: getIpAddress(req), client_user_agent: req.headers['user-agent'],
  }
  const fbp = req.headers['x-fbp']; const fbc = req.headers['x-fbc']
  if (fbp) user_data.fbp = fbp
  if (fbc) user_data.fbc = fbc
  const response = await fetch(`https://graph.facebook.com/v20.0/${process.env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(process.env.META_CAPI_ACCESS_TOKEN)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [{ event_name: 'Purchase', event_time: Math.floor(Date.now() / 1000), event_id: eventId, action_source: 'website', event_source_url: req.headers.referer, user_data, custom_data: { value: Number(order.amount), currency: 'INR', content_name: order.product_name, content_ids: [order.product_id], content_type: 'product' } }] }),
  })
  if (!response.ok) throw new Error(`Meta CAPI returned ${response.status}`)
}
