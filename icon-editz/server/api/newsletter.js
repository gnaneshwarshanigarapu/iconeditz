import { z } from 'zod'
import { authorizeAdmin } from '../lib/auth.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { withApi } from '../lib/handler.js'

const emailSchema = z.object({ email: z.string().email() })
async function subscribe(req, res) {
  const { email } = emailSchema.parse(req.body)
  const { error } = await supabaseAdmin.from('newsletter_subscribers').upsert({ email, status: 'active' }, { onConflict: 'email' })
  if (error) throw error
  return res.status(201).json({ success: true })
}
async function list(req, res) { await authorizeAdmin(req); const { data, error } = await supabaseAdmin.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }); if (error) throw error; return res.json({ success: true, data: data || [] }) }
async function remove(req, res) { await authorizeAdmin(req); if (!req.query.id) throw Object.assign(new Error('Subscriber ID is required'), { status: 400 }); const { error } = await supabaseAdmin.from('newsletter_subscribers').delete().eq('id', req.query.id); if (error) throw error; return res.status(204).end() }
export default withApi({ GET: list, POST: subscribe, DELETE: remove })
