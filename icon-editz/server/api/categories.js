import { z } from 'zod'
import { authorizeAdmin, tryAuthenticate } from '../lib/auth.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { withApi } from '../lib/handler.js'

const categorySchema = z.object({ name: z.string().trim().min(1).max(100), slug: z.string().trim().min(1).max(120).optional() })
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

async function list(req, res) {
  const user = await tryAuthenticate(req)
  let query = supabaseAdmin.from('categories').select('*').is('deleted_at', null).order('created_at', { ascending: false })
  if (user?.role !== 'admin') query = query.eq('status', 'published')
  const { data, error } = await query
  if (error) throw error
  return res.json({ success: true, data: data || [] })
}
async function create(req, res) {
  await authorizeAdmin(req)
  const value = categorySchema.parse(req.body)
  const { data, error } = await supabaseAdmin.from('categories').insert({ ...value, slug: value.slug || slugify(value.name), status: 'published' }).select().single()
  if (error) throw error
  return res.status(201).json({ success: true, data })
}
async function remove(req, res) {
  await authorizeAdmin(req)
  if (!req.query.id) throw Object.assign(new Error('Category ID is required'), { status: 400 })
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', req.query.id)
  if (error) throw error
  return res.status(204).end()
}
export default withApi({ GET: list, POST: create, DELETE: remove })
