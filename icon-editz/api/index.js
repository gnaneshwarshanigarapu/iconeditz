import auth from '../server/api/auth.js'
import products from '../server/api/products.js'
import categories from '../server/api/categories.js'
import cms from '../server/api/cms.js'
import orders from '../server/api/orders.js'
import customers from '../server/api/customers.js'
import paymentAttempts from '../server/api/payment-attempts.js'
import downloads from '../server/api/downloads.js'
import uploads from '../server/api/uploads.js'
import settings from '../server/api/settings.js'
import newsletter from '../server/api/newsletter.js'
import admin from '../server/api/admin.js'
import hireRequests from '../server/api/hire-requests.js'
import health from '../server/api/health.js'
import razorpayWebhook from '../server/api/webhooks/razorpay.js'

export const config = { api: { bodyParser: false } }

const handlers = {
  auth,
  products,
  categories,
  cms,
  orders,
  customers,
  'payment-attempts': paymentAttempts,
  downloads,
  uploads,
  settings,
  newsletter,
  admin,
  'hire-requests': hireRequests,
  health,
  webhook: razorpayWebhook,
  webhooks: razorpayWebhook,
}

const parseJsonBody = async (req) => {
  if (req.body || req.method === 'GET' || req.headers['content-type']?.includes('multipart/form-data')) return
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString('utf8')
  req.body = text ? JSON.parse(text) : {}
}

export default async function handler(req, res) {
  const route = String(req.query.route || '').replace(/^\/+|\/+$/g, '')
  const [resource, id] = route.split('/')
  const endpoint = handlers[resource]
  if (!endpoint) return res.status(404).json({ success: false, message: 'API endpoint not found' })
  if (resource === 'products' && id && !req.query.id) req.query.id = decodeURIComponent(id)
  try {
    await parseJsonBody(req)
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON request body' })
  }
  return endpoint(req, res)
}
