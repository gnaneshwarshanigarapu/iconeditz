import React from 'react'
import { Link } from 'react-router-dom'
import { Database, RefreshCw } from 'lucide-react'

export function isMissingSchemaError(error) {
  const message = String(error?.message || error || '').toLowerCase()
  return message.includes('schema cache') || message.includes('could not find the table') || message.includes('relation') && message.includes('does not exist')
}

export default function DatabaseSetupNotice({ error, onRetry }) {
  const missing = isMissingSchemaError(error)
  return <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-6 text-amber-50"><div className="flex gap-3"><Database className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" /><div><h2 className="font-semibold">{missing ? 'Database setup is required' : 'This CMS section is temporarily unavailable'}</h2><p className="mt-2 text-sm leading-6 text-amber-100/80">{missing ? 'The required CMS migration has not been applied. Run supabase db push from the repository root, then retry.' : 'Check the database health page or try again in a moment.'}</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-black"><RefreshCw className="h-4 w-4" />Retry</button><Link to="/admin/health" className="rounded-xl border border-amber-200/30 px-4 py-2 text-sm font-semibold">Open Database Health Check</Link></div></div></div></div>
}
