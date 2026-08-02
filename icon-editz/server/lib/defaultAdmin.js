import { supabaseAdmin } from './supabaseAdmin.js'

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@iconeditz.com'
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'icon@123'
const DEFAULT_ADMIN_NAME = 'Icon Editz Admin'
let bootstrapPromise

const hasAdminRole = (user) => user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin'

async function listAllUsers() {
  const users = []
  let page = 1
  const perPage = 1000
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const batch = data?.users || []
    users.push(...batch)
    if (batch.length < perPage) return users
    page += 1
  }
}

/**
 * Creates the initial administrator exactly once. Existing administrators and
 * existing passwords are never modified.
 */
async function bootstrapDefaultAdmin() {
  const { data: adminRows, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('user_id')
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(1)
  if (adminError) throw adminError
  if (adminRows?.length) return { created: false, reason: 'admin_record_exists' }

  const users = await listAllUsers()
  if (users.some(hasAdminRole)) return { created: false, reason: 'admin_exists' }

  const existingUser = users.find((user) => user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())
  const metadata = { role: 'admin', full_name: DEFAULT_ADMIN_NAME }

  if (existingUser) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      app_metadata: { ...(existingUser.app_metadata || {}), role: 'admin' },
      user_metadata: { ...(existingUser.user_metadata || {}), ...metadata },
    })
    if (error) throw error
    console.info(JSON.stringify({ event: 'default_admin_promoted' }))
    return { created: false, reason: 'existing_user_promoted' }
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    email_confirm: true,
    app_metadata: { role: 'admin' },
    user_metadata: metadata,
  })
  if (error) throw error
  if (!data.user) throw new Error('Supabase did not return the default administrator')
  console.info(JSON.stringify({ event: 'default_admin_created' }))
  return { created: true, reason: 'created' }
}

export const ensureDefaultAdmin = async () => {
  bootstrapPromise ||= bootstrapDefaultAdmin().catch((error) => {
    bootstrapPromise = undefined
    throw error
  })
  return bootstrapPromise
}
