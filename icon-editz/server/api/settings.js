import { z } from 'zod'
import { authorizeAdmin } from '../lib/auth.js'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { withApi } from '../lib/handler.js'

async function getSettings(req, res) {
  await authorizeAdmin(req)
  const { data, error } = await supabaseAdmin.from('settings').select('key,value').is('deleted_at', null)
  if (error) throw error
  return res.json({ success: true, data: Object.fromEntries((data || []).map(({ key, value }) => [key, value])) })
}
async function saveSettings(req, res) {
  await authorizeAdmin(req)
  const body = z.object({ settings: z.record(z.any()) }).parse(req.body)
  const rows = Object.entries(body.settings).map(([key, value]) => ({ key, value, status: 'published' }))
  const { error } = await supabaseAdmin.from('settings').upsert(rows, { onConflict: 'key' })
  if (error) throw error
  return res.json({ success: true })
}
export default withApi({ GET: getSettings, PUT: saveSettings })
