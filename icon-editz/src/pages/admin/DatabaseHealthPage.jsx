import React, { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Database, RefreshCw, XCircle } from 'lucide-react'
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../../utils/supabase'

const checks = [
  ['missing_tables', 'Table missing'],
  ['missing_columns', 'Missing column'],
  ['missing_policies', 'Missing policy'],
  ['missing_storage_buckets', 'Missing storage bucket'],
  ['missing_seed_data', 'Missing seed data'],
]

export default function DatabaseHealthPage() {
  const [state, setState] = useState({ loading: true, result: {}, error: '' })
  const check = useCallback(async () => {
    if (!isSupabaseConfigured()) return setState({ loading: false, result: {}, error: supabaseConfigError })
    setState({ loading: true, result: {}, error: '' })
    const { data, error } = await supabase.rpc('admin_health_check')
    setState({ loading: false, result: data || {}, error: error ? 'Health check could not run. Initialize the master database migration, then retry.' : '' })
  }, [])
  useEffect(() => { check() }, [check])
  const failures = checks.flatMap(([key, label]) => (state.result[key] || []).map((item) => ({ key, label, item })))
  return <div className="max-w-4xl space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Supabase</p><h2 className="mt-1 text-2xl font-bold text-white">Database Health Check</h2><p className="mt-2 text-sm text-text-muted">Verify database schema, RLS, R2 metadata, and CMS seed records.</p></div><button onClick={check} disabled={state.loading} className="admin-button-primary"><RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />Retry</button></header><div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 text-sm text-amber-100"><p className="font-semibold">Initialize Database</p><p className="mt-1">If this project is empty, run exactly <code>supabase/migrations/001_full_database.sql</code> in the Supabase SQL Editor, then retry. It is safe to run more than once.</p></div><div className="grid gap-3 sm:grid-cols-2"><HealthItem label="Environment" detail={isSupabaseConfigured() ? 'Ready' : supabaseConfigError} ok={isSupabaseConfigured()} />{checks.map(([key, label]) => { const missing = state.result[key] || []; return <HealthItem key={key} label={label} detail={missing.length ? missing.join(', ') : 'Ready'} ok={!missing.length && !state.error} /> })}</div>{failures.length > 0 && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-100"><p className="font-semibold">Action required</p>{failures.map(({ key, label, item }) => <p key={`${key}-${item}`} className="mt-1">{label}: {item}</p>)}</div>}<div className="rounded-2xl border border-white/10 bg-white/[.04] p-5 text-sm text-text-muted"><Database className="mb-2 h-5 w-5 text-primary" />Database initialization remains SQL-driven because browser clients cannot safely create tables or policies.</div></div>
}

function HealthItem({ label, detail, ok }) { return <div className={`flex items-center gap-3 rounded-xl border p-4 ${ok ? 'border-emerald-400/20 bg-emerald-500/10' : 'border-red-400/20 bg-red-500/10'}`}>{ok ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <XCircle className="h-5 w-5 text-red-300" />}<div><p className="text-sm font-semibold text-white">{label}</p><p className="text-xs text-white/60">{detail || 'Unavailable'}</p></div></div> }
