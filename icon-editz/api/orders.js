import { authenticate } from './lib/auth.js'
import { withApi } from './lib/handler.js'
import { supabaseAdmin } from './lib/supabaseAdmin.js'

async function listOrders(req, res) {
  const user = await authenticate(req)
  let query = supabaseAdmin.from('orders').select('*, products(*)').order('created_at', { ascending: false })
  if (user.role !== 'admin') query = query.eq('user_id', user.sub)
  const { data, error } = await query
  if (error) throw error
  return res.json({ data: data || [] })
}

export default withApi(['GET'], listOrders)
