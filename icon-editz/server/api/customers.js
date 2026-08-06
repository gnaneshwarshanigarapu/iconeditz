import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authorizeAdmin } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'

async function listCustomers(req, res) {
  await authorizeAdmin(req)

  // 1. Try reading from customers table
  const { data: customerRows, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && Array.isArray(customerRows) && customerRows.length > 0) {
    const formatted = customerRows.map((c) => ({
      ...c,
      email: c.email,
      name: c.name || c.email.split('@')[0],
      totalOrders: Number(c.total_orders || c.orders_count || 1),
      totalSpent: Number(c.total_spent || c.ltv || 0),
      lastPurchase: c.last_purchase_at || c.updated_at || c.created_at,
    }))
    return res.json({ success: true, data: formatted, customers: formatted })
  }

  // 2. If customers table is empty, aggregate strictly from live orders table
  const { data: orders = [] } = await supabaseAdmin
    .from('orders')
    .select('id,customer_name,customer_email,customer_phone,user_email,email,amount,payment_status,status,created_at')
    .or('payment_status.eq.PAID,status.eq.paid')
    .order('created_at', { ascending: false })

  const map = new Map()
  orders.forEach((o) => {
    const email = (o.customer_email || o.user_email || o.email || '').trim().toLowerCase()
    if (!email) return

    if (!map.has(email)) {
      map.set(email, {
        id: o.id,
        email,
        name: o.customer_name || email.split('@')[0] || 'Customer',
        phone: o.customer_phone || '',
        totalOrders: 0,
        totalSpent: 0,
        lastPurchase: o.created_at,
        orders: [],
      })
    }
    const cust = map.get(email)
    cust.totalOrders += 1
    cust.totalSpent += Number(o.amount || 0)
    cust.orders.push(o)
  })

  const liveCustomers = Array.from(map.values())
  return res.json({ success: true, data: liveCustomers, customers: liveCustomers })
}

export default withApi(['GET'], listCustomers)
