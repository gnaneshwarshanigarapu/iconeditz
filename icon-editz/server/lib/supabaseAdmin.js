import { createClient } from '@supabase/supabase-js'

let client

export const getSupabaseAdmin = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw Object.assign(new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'), { status: 500 })
  }
  client ||= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  return client
}

export const supabaseAdmin = new Proxy({}, {
  get(_target, property) {
    const value = getSupabaseAdmin()[property]
    return typeof value === 'function' ? value.bind(getSupabaseAdmin()) : value
  },
})
