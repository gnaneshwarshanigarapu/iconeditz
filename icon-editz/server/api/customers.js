import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authorizeAdmin } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'

async function listCustomers(req, res) {
  await authorizeAdmin(req)

  // Fetch all orders with order_items join
  const { data: allOrders = [] } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(*))')
    .order('created_at', { ascending: false })

  // Map orders into customer profiles strictly calculating LTV from PAID orders
  const customerMap = new Map()

  allOrders.forEach((o) => {
    const email = (o.customer_email || o.user_email || o.email || '').trim().toLowerCase()
    if (!email) return

    const isPaid = (o.payment_status || o.status || '').toUpperCase() === 'PAID' || (o.payment_status || o.status || '').toUpperCase() === 'SUCCESS' || (o.payment_status || o.status || '').toUpperCase() === 'CAPTURED'

    if (!customerMap.has(email)) {
      customerMap.set(email, {
        id: o.customer_id || o.id,
        email,
        name: o.customer_name || email.split('@')[0] || 'Customer',
        phone: o.customer_phone || '',
        totalOrders: 0,
        totalSpent: 0,
        lastPurchase: null,
        purchases: [],
      })
    }

    const cust = customerMap.get(email)
    if (o.customer_phone && !cust.phone) cust.phone = o.customer_phone
    if (o.customer_name && cust.name === 'Customer') cust.name = o.customer_name

    // Record purchase item in drawer history
    let items = o.order_items || []
    if (items.length === 0) {
      items = [{
        product_name: o.product_name || 'Creative Asset',
        quantity: 1,
        unit_price: Number(o.amount || 0),
        total_price: Number(o.amount || 0),
      }]
    }

    items.forEach((item) => {
      cust.purchases.push({
        orderId: o.id,
        razorpayOrderId: o.razorpay_order_id || 'N/A',
        razorpayPaymentId: o.razorpay_payment_id || 'N/A',
        productName: item.product_name || 'Creative Asset',
        quantity: item.quantity || 1,
        unitPrice: Number(item.unit_price || o.amount || 0),
        amount: Number(item.total_price || o.amount || 0),
        status: isPaid ? 'PAID' : 'PENDING / FAILED',
        downloadStatus: isPaid ? 'Delivered & Active' : 'Locked',
        createdAt: o.created_at,
      })
    })

    // Strictly add to LTV and Order Count if PAID
    if (isPaid) {
      cust.totalOrders += 1
      cust.totalSpent += Number(o.amount || 0)
      if (!cust.lastPurchase || new Date(o.created_at) > new Date(cust.lastPurchase)) {
        cust.lastPurchase = o.created_at
      }
    }
  })

  const formattedCustomers = Array.from(customerMap.values())
  return res.json({ success: true, data: formattedCustomers, customers: formattedCustomers })
}

export default withApi(['GET'], listCustomers)
