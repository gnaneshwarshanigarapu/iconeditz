import { supabaseAdmin } from './supabaseAdmin.js'

export const authenticate = async (req) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) throw Object.assign(new Error('Authentication required'), { status: 401 })
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) throw Object.assign(new Error('Invalid or expired Supabase session'), { status: 401 })
  const metadataRole = user.app_metadata?.role || user.user_metadata?.role
  const { data: admin } = metadataRole === 'admin' ? { data: null } : await supabaseAdmin.from('admins').select('id').eq('user_id', user.id).eq('status', 'active').is('deleted_at', null).maybeSingle()
  return { sub: user.id, email: user.email, role: metadataRole || (admin ? 'admin' : 'customer') }
}

export const tryAuthenticate = async (req) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  const metadataRole = user.app_metadata?.role || user.user_metadata?.role
  const { data: admin } = metadataRole === 'admin' ? { data: null } : await supabaseAdmin.from('admins').select('id').eq('user_id', user.id).eq('status', 'active').is('deleted_at', null).maybeSingle()
  return { sub: user.id, email: user.email, role: metadataRole || (admin ? 'admin' : 'customer') }
}

export const authorizeAdmin = async (req) => {
  const user = await authenticate(req)
  if (user.role !== 'admin') throw Object.assign(new Error('Admin access required'), { status: 403 })
  return user
}
