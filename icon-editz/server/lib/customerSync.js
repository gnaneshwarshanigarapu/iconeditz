import { supabaseAdmin } from './supabaseAdmin.js'

/**
 * Synchronizes customer profile upon completed purchase.
 * Updates total_orders, total_spent, and last_purchase_at without creating duplicate emails.
 */
export async function syncCustomerOnPayment({ name, email, phone, amount }) {
  if (!email || typeof email !== 'string') return null

  const normalizedEmail = email.trim().toLowerCase()
  const orderAmount = Number(amount || 0)
  const now = new Date().toISOString()

  try {
    // Check if customer exists in customers table
    const { data: existing, error: selectErr } = await supabaseAdmin
      .from('customers')
      .select('id, name, email, phone, total_orders, total_spent')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (selectErr && selectErr.code !== 'PGRST116') {
      console.warn('Customer lookup error:', selectErr.message)
    }

    if (existing) {
      const currentOrders = Number(existing.total_orders || 0)
      const currentSpent = Number(existing.total_spent || 0)

      const payload = {
        total_orders: currentOrders + 1,
        total_spent: currentSpent + orderAmount,
        last_purchase_at: now,
        updated_at: now,
      }

      if (name && (!existing.name || existing.name === 'Customer')) payload.name = name
      if (phone && !existing.phone) payload.phone = phone

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('customers')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()

      if (updateErr) console.warn('Customer update warning:', updateErr.message)
      return updated || { ...existing, ...payload }
    }

    // Insert new customer
    const newCustomer = {
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0] || 'Customer',
      phone: phone || null,
      total_orders: 1,
      total_spent: orderAmount,
      last_purchase_at: now,
      status: 'active',
      created_at: now,
      updated_at: now,
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('customers')
      .insert([newCustomer])
      .select()
      .single()

    if (insertErr) {
      console.warn('Customer insert warning:', insertErr.message)
      return newCustomer
    }

    return inserted
  } catch (err) {
    console.error('Customer sync exception:', err.message)
    return null
  }
}
