import React, { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Database, RefreshCw, XCircle } from 'lucide-react'
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../../utils/supabase'

const required = ['page_content', 'website_sections', 'products', 'orders', 'categories', 'media_library', 'analytics', 'customers', 'services', 'projects', 'settings', 'coupons', 'enquiries', 'storage_buckets', 'rls_policies']

export default function DatabaseHealthPage() {
  const [state, setState] = useState({ loading: true, result: {}, error: '' })
  const check = useCallback(async () => {
    if (!isSupabaseConfigured()) return setState({ loading: false, result: {}, error: supabaseConfigError })
    setState({ loading: true, result: {}, error: '' })
    const { data, error } = await supabase.rpc('admin_health_check')
    setState({ loading: false, result: data || {}, error: error ? 'Health check could not run. Initialize the master database migration, then retry.' : '' })
  }, [])
  useEffect(() => { check() }, [check])
  return <div className="max-w-4xl space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Supabase</p><h2 className="mt-1 text-2xl font-bold text-white">Database Health Check</h2><p className="mt-2 text-sm text-text-muted">Verify database tables, RLS setup, storage metadata, and client configuration.</p></div><button onClick={check} disabled={state.loading} className="admin-button-primary"><RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />Retry</button></header>{state.error && <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 text-sm text-amber-100"><p className="font-semibold">Initialize Database</p><p className="mt-1">Run <code>supabase/migrations/001_full_database.sql</code> in Supabase SQL Editor. This safely creates missing tables, indexes, policies, and default CMS records.</p></div>}<div className="grid gap-3 sm:grid-cols-2">{['environment', ...required].map((key) => { const ok = key === 'environment' ? isSupabaseConfigured() : Boolean(state.result[key]); return <div key={key} className={`flex items-center gap-3 rounded-xl border p-4 ${ok ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-red-400/20 bg-red-500/10'}`}>{ok ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <XCircle className="h-5 w-5 text-red-300" />}<div><p className="text-sm font-semibold text-white">{key.replaceAll('_', ' ')}</p><p className="text-xs text-white/60">{ok ? 'Ready' : 'Missing or unavailable'}</p></div></div>})}</div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-5 text-sm text-text-muted"><Database className="mb-2 h-5 w-5 text-primary" />The Initialize Database action is intentionally SQL-driven: browsers using the anonymous Supabase key cannot safely create database tables or policies.</div></div>
}
