import React, { useCallback, useEffect, useState } from 'react'
import {
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiRefreshCw,
  FiTool,
  FiShield,
  FiDatabase,
  FiServer,
  FiLock,
  FiLayers,
} from 'react-icons/fi'
import { request } from '../../utils/api'

export default function DatabaseHealthPage() {
  const [loading, setLoading] = useState(true)
  const [repairing, setRepairing] = useState(false)
  const [diagnostics, setDiagnostics] = useState([])
  const [error, setError] = useState('')
  const [repairNotice, setRepairNotice] = useState('')

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await request('/api/health')
      setDiagnostics(res.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch backend health diagnostics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  const handleRepairDatabase = async () => {
    setRepairing(true)
    setRepairNotice('')
    try {
      const res = await request('/api/health', {
        method: 'POST',
        body: { action: 'repair' },
      })
      setRepairNotice('✅ Database repair and index migrations executed successfully!')
      if (res.data) {
        setDiagnostics(res.data)
      } else {
        await fetchHealth()
      }
    } catch (err) {
      setRepairNotice(`🔴 Repair error: ${err.message}`)
    } finally {
      setRepairing(false)
    }
  }

  const passCount = diagnostics.filter((d) => d.status === 'PASS').length
  const warningCount = diagnostics.filter((d) => d.status === 'WARNING').length
  const failCount = diagnostics.filter((d) => d.status === 'FAIL').length

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#120c24] via-[#170e30] to-[#0f0a1f] p-6 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
              Production Diagnostics
            </span>
            <span className="text-xs text-text-muted">Node.js Serverless API</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Enterprise Database & Service Health</h2>
          <p className="mt-1 text-xs text-text-muted">
            Server-side verification of PostgreSQL tables, indexes, RPCs, storage buckets & third-party API configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh Diagnostics</span>
          </button>

          <button
            onClick={handleRepairDatabase}
            disabled={repairing}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <FiTool className={repairing ? 'animate-spin' : ''} />
            <span>{repairing ? 'Executing Repair...' : 'Repair Database'}</span>
          </button>
        </div>
      </div>

      {/* Repair Notice */}
      {repairNotice && (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs font-semibold text-white shadow-lg">
          {repairNotice}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {/* Overview Status Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-2xl text-emerald-400" />
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase">Passing Checks</p>
              <p className="text-2xl font-extrabold text-white">{passCount}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">Operational</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-2xl text-amber-400" />
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase">Warnings</p>
              <p className="text-2xl font-extrabold text-white">{warningCount}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg">Optional</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <FiXCircle className="text-2xl text-rose-400" />
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase">Action Required</p>
              <p className="text-2xl font-extrabold text-white">{failCount}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${failCount > 0 ? 'text-rose-400 bg-rose-500/20' : 'text-emerald-400 bg-emerald-500/20'}`}>
            {failCount > 0 ? 'Requires Repair' : 'Clean'}
          </span>
        </div>
      </div>

      {/* Diagnostics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {diagnostics.map((item) => {
            const isPass = item.status === 'PASS'
            const isWarn = item.status === 'WARNING'

            const statusClass = isPass
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400'
              : isWarn
              ? 'border-amber-500/30 bg-amber-500/5 text-amber-400'
              : 'border-rose-500/30 bg-rose-500/5 text-rose-400'

            const Icon = isPass ? FiCheckCircle : isWarn ? FiAlertCircle : FiXCircle

            return (
              <div
                key={item.id || item.label}
                className={`flex items-start gap-3.5 rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all ${statusClass}`}
              >
                <Icon className="text-xl shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{item.label}</h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        isPass
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isWarn
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed font-mono text-[11px] truncate">
                    {item.detail}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Security Architecture Box */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-5 text-xs text-text-muted shadow-xl backdrop-blur-xl flex items-center gap-3">
        <FiLock className="text-2xl text-primary shrink-0" />
        <div>
          <p className="font-bold text-white">Secure Backend Diagnostic Architecture</p>
          <p className="mt-0.5 text-[11px]">
            All health inspections and database repairs execute strictly on the Node.js serverless backend. Privileged credentials (SUPABASE_SERVICE_ROLE_KEY, R2_SECRET_ACCESS_KEY, RAZORPAY_KEY_SECRET, RESEND_API_KEY) are never exposed to browser context.
          </p>
        </div>
      </div>
    </div>
  )
}
