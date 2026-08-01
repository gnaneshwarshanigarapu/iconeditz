import React, { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Database, RefreshCw, XCircle } from 'lucide-react'
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../../utils/supabase'

const requiredTables = ['profiles', 'admins', 'settings', 'page_content', 'website_sections', 'products', 'product_images', 'product_gallery', 'categories', 'orders', 'order_items', 'customers', 'downloads', 'media_library', 'services', 'projects', 'testimonials', 'coupons', 'analytics', 'enquiries', 'newsletter_subscribers', 'activity_logs', 'r2_buckets', 'r2_objects']
const databaseChecks = [
  ['missing_tables', 'Tables'], ['missing_columns', 'Columns'], ['missing_indexes', 'Indexes'], ['missing_foreign_keys', 'Foreign Keys'],
  ['missing_policies', 'Policies'], ['rls_disabled', 'RLS'], ['missing_storage_buckets', 'Storage Buckets'],
  ['missing_seed_data', 'Seed Data'], ['missing_rpc_functions', 'RPC Functions'],
]

const tableMissing = (error) => ['PGRST205', '42P01'].includes(error?.code) || /schema cache|relation .* does not exist|could not find the table/i.test(error?.message || '')

export default function DatabaseHealthPage() {
  const [state, setState] = useState({ loading: true, result: {}, missingTables: [], error: '' })
  const check = useCallback(async () => {
    if (!isSupabaseConfigured()) return setState({ loading: false, result: {}, missingTables: [], error: supabaseConfigError })
    setState({ loading: true, result: {}, missingTables: [], error: '' })
    const probes = await Promise.all(requiredTables.map(async (table) => {
      const { error } = await supabase.from(table).select('id', { head: true }).limit(1)
      return tableMissing(error) ? table : null
    }))
    const missingTables = probes.filter(Boolean)
    if (missingTables.length) return setState({ loading: false, result: {}, missingTables, error: 'Migrations have not been applied to this Supabase project.' })
    // The RPC is called only after the required relation preflight succeeds. A missing RPC is reported, not thrown.
    const { data, error } = await supabase.rpc('admin_health_check')
    const result = data || {}
    if (error) result.missing_rpc_functions = ['admin_health_check']
    setState({ loading: false, result, missingTables: [], error: error ? 'Database relations exist, but the migration RPC is missing or unavailable.' : '' })
  }, [])
  useEffect(() => { check() }, [check])

  const failures = databaseChecks.flatMap(([key, label]) => (key === 'missing_tables' ? state.missingTables : state.result[key] || []).map((item) => ({ label, item })))
  const integrations = [
    ['Authentication', isSupabaseConfigured() && state.result.environment?.supabase_auth_schema !== false, isSupabaseConfigured() ? 'Client and Auth schema available' : supabaseConfigError],
    ['Cloudflare R2', Boolean(state.result.cloudflare_r2?.metadata_table), state.result.cloudflare_r2?.metadata_table ? 'Metadata schema ready; credentials are verified at deployment' : 'R2 metadata schema missing'],
    ['Razorpay', Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID), import.meta.env.VITE_RAZORPAY_KEY_ID ? 'Public key configured; server secret is deployment-only' : 'VITE_RAZORPAY_KEY_ID missing'],
    ['Resend', Boolean(import.meta.env.VITE_RESEND_CONFIGURED), import.meta.env.VITE_RESEND_CONFIGURED ? 'Deployment marked Resend configured' : 'Set VITE_RESEND_CONFIGURED=true after verifying server credentials'],
  ]

  return <div className="max-w-4xl space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Supabase</p><h2 className="mt-1 text-2xl font-bold text-white">Database Health Check</h2><p className="mt-2 text-sm text-text-muted">Checks the deployed schema without requiring an Edge Function or privileged browser credential.</p></div><button onClick={check} disabled={state.loading} className="admin-button-primary"><RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />Retry</button></header>{state.error && <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 text-sm text-amber-100"><p className="font-semibold">Apply Supabase migrations</p><p className="mt-1">Run <code>supabase db push</code> from this repository after linking the intended project. The master migration creates all database objects and default CMS records.</p></div>}<div className="grid gap-3 sm:grid-cols-2"><HealthItem label="Environment" detail={isSupabaseConfigured() ? 'PASS — Ready' : `FAIL — ${supabaseConfigError}`} ok={isSupabaseConfigured()} />{databaseChecks.map(([key, label]) => { const missing = key === 'missing_tables' ? state.missingTables : state.result[key] || []; return <HealthItem key={key} label={label} detail={missing.length ? `FAIL — ${missing.join(', ')}` : 'PASS — Ready'} ok={!missing.length && !(key !== 'missing_tables' && state.error)} /> })}{integrations.map(([label, ok, detail]) => <HealthItem key={label} label={label} detail={`${ok ? 'PASS' : 'FAIL'} — ${detail}`} ok={ok} />)}</div>{failures.length > 0 && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-100"><p className="font-semibold">Missing database objects</p>{failures.map(({ label, item }) => <p key={`${label}-${item}`} className="mt-1">{label}: {item}</p>)}</div>}<div className="rounded-2xl border border-white/10 bg-white/[.04] p-5 text-sm text-text-muted"><Database className="mb-2 h-5 w-5 text-primary" />Migrations—not browser code or Edge Functions—own database schema creation and repair.</div></div>
}

function HealthItem({ label, detail, ok }) { return <div className={`flex items-center gap-3 rounded-xl border p-4 ${ok ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-red-400/20 bg-red-500/10'}`}>{ok ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <XCircle className="h-5 w-5 text-red-300" />}<div><p className="text-sm font-semibold text-white">{label}</p><p className="text-xs text-white/60">{detail || 'Unavailable'}</p></div></div> }
