import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const requiredTables = [
  'profiles', 'admins', 'settings', 'page_content', 'website_sections', 'products',
  'product_images', 'product_gallery', 'categories', 'orders', 'order_items',
  'customers', 'downloads', 'media_library', 'services', 'projects', 'testimonials',
  'coupons', 'analytics', 'enquiries', 'newsletter_subscribers', 'activity_logs',
]

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const managementQuery = async (query: string, readOnly = false) => {
  const token = Deno.env.get('SUPABASE_MANAGEMENT_API_TOKEN')
  const projectRef = Deno.env.get('SUPABASE_PROJECT_REF')
  if (!token || !projectRef) throw new Error('Database initialization is not configured on this Edge Function.')
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query${readOnly ? '/read-only' : ''}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, read_only: readOnly }),
  })
  if (!response.ok) throw new Error(`Supabase Management API failed (${response.status}).`)
  return response.json()
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authorization = request.headers.get('Authorization')
  if (!authorization) return json({ error: 'Authentication required' }, 401)
  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !anonKey || !serviceKey) return json({ error: 'Function secrets are incomplete' }, 500)

  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) return json({ error: 'Invalid Supabase session' }, 401)

  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } })
  const metadataAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
  const { data: adminRecord } = metadataAdmin ? { data: null } : await adminClient
    .from('admins').select('id').eq('user_id', user.id).eq('status', 'active').is('deleted_at', null).maybeSingle()
  if (!metadataAdmin && !adminRecord) return json({ error: 'Admin access required' }, 403)

  try {
    const progress = ['Checking database schema']
    const relationSql = `select table_name from information_schema.tables where table_schema = 'public' and table_name in (${requiredTables.map((table) => `'${table}'`).join(',')})`
    const existing = await managementQuery(relationSql, true)
    const existingNames = new Set((Array.isArray(existing) ? existing : existing.result || []).map((row: { table_name: string }) => row.table_name))
    const missing = requiredTables.filter((table) => !existingNames.has(table))

    // This is a fixed, operator-provided migration; request input is never executed as SQL.
    const sql = Deno.env.get('INITIALIZATION_SQL')
    if (!sql) return json({ error: 'INITIALIZATION_SQL secret is not configured', progress }, 500)
    progress.push(missing.length ? `Creating ${missing.length} missing database tables and related objects` : 'Reconciling indexes, policies, buckets, and seed data')
    await managementQuery(sql)
    progress.push('Refreshing schema and validating initialization')
    const finalCheck = await managementQuery(relationSql, true)
    const finalNames = new Set((Array.isArray(finalCheck) ? finalCheck : finalCheck.result || []).map((row: { table_name: string }) => row.table_name))
    const unresolved = requiredTables.filter((table) => !finalNames.has(table))
    if (unresolved.length) return json({ error: 'Initialization completed with missing tables', missing_tables: unresolved, progress }, 500)
    progress.push('Database initialized successfully')
    return json({ ok: true, created_tables: missing, progress })
  } catch (error) {
    console.error(error)
    return json({ error: error instanceof Error ? error.message : 'Database initialization failed' }, 500)
  }
})
