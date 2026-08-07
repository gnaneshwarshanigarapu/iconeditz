import { supabaseAdmin } from './supabaseAdmin.js'

/**
 * Recalculates customer lifetime metrics strictly from PAID orders.
 */
export async function syncCustomerOnPayment({ name, email, phone }) {
  if (!email || typeof email !== 'string') return null

  const normalizedEmail = email.trim().toLowerCase()
  const now = new Date().toISOString()

  try {
    // 1. Calculate LTV & Total Orders strictly from captured/PAID orders
    const { data: rawPaidOrders } = await supabaseAdmin
      .from('orders')
      .select('amount, created_at')
      .or(`customer_email.eq.${normalizedEmail},email.eq.${normalizedEmail}`)
      .or('payment_status.eq.PAID,status.eq.paid,payment_status.eq.captured')

    const paidOrders = Array.isArray(rawPaidOrders) ? rawPaidOrders : []
    const totalOrdersCount = paidOrders.length
    const totalSpentAmount = paidOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0)
    const latestOrderDate = paidOrders[0]?.created_at || now

    // 2. Check if customer exists in customers table
    const { data: existing } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      const payload = {
        total_orders: totalOrdersCount,
        total_spent: totalSpentAmount,
        last_purchase_at: totalOrdersCount > 0 ? latestOrderDate : existing.last_purchase_at,
        updated_at: now,
      }

      if (name && (!existing.name || existing.name === 'Customer')) payload.name = name
      if (phone && !existing.phone) payload.phone = phone

      const { data: updated } = await supabaseAdmin
        .from('customers')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()

      return updated || { ...existing, ...payload }
    }

    // 3. Insert new customer if missing
    const newCustomer = {
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0] || 'Customer',
      phone: phone || null,
      total_orders: totalOrdersCount,
      total_spent: totalSpentAmount,
      last_purchase_at: totalOrdersCount > 0 ? latestOrderDate : null,
      status: 'active',
      created_at: now,
      updated_at: now,
    }

    const { data: inserted } = await supabaseAdmin
      .from('customers')
      .insert([newCustomer])
      .select()
      .single()

    return inserted || newCustomer
  } catch (err) {
    console.error('Customer sync exception:', err.message)
    return null
  }
}
