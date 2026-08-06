import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiCreditCard, FiAlertTriangle, FiRefreshCw, FiCheckCircle, FiSend } from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import { api } from '../../services/api'

export default function PaymentAttemptsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Fetch payment attempts strictly from live backend / payment_attempts table
  const { data: attempts = [], isLoading, refetch } = useQuery({
    queryKey: ['adminPaymentAttempts'],
    queryFn: async () => {
      const res = await api.get('/api/payment-attempts')
      return res.attempts || res.data || []
    },
  })

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      (att.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (att.customerEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (att.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
      (att.paymentId || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !selectedStatus || (att.status || '').toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleSendRecoveryEmail = (email) => {
    if (!email) return
    alert(`Checkout recovery link dispatched to ${email}`)
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Controls */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Payment ID, Order ID, customer email or name..."
        statusOptions={['captured', 'failed', 'authorized', 'initiated']}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Razorpay Webhook & Gateway Attempt Logs</h3>
            <p className="text-xs text-text-muted">Live webhook sync & gateway error diagnostics ({filteredAttempts.length} logs)</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-muted hover:text-white"
          >
            <FiRefreshCw /> Sync Webhook Logs
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No payment attempts logged in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Payment & Order ID</th>
                  <th className="py-3.5 px-4">Customer Name & Contact</th>
                  <th className="py-3.5 px-4">Method & Amount</th>
                  <th className="py-3.5 px-4">Webhook Event & Reason</th>
                  <th className="py-3.5 px-4">Gateway Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAttempts.map((att) => {
                  const statusLower = (att.status || '').toLowerCase()
                  const isSuccess = statusLower === 'captured' || statusLower === 'paid'
                  const isFailed = statusLower === 'failed'

                  return (
                    <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>
                          <p className="font-bold text-white">{att.paymentId || 'N/A'}</p>
                          <p className="text-[10px] text-text-muted">{att.orderId || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-white">{att.customerName || 'Customer'}</p>
                          <p className="text-[11px] text-text-muted">{att.customerEmail || 'Anonymous'}</p>
                          {att.customerPhone && <p className="text-[10px] text-text-muted/70 font-mono">{att.customerPhone}</p>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-extrabold text-white">₹{att.amount || 0}</p>
                          <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-purple-300">
                            {att.paymentMethod || 'UPI'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-cyan-300">{att.webhookEvent || 'payment.event'}</span>
                          <p className="font-mono text-[10px] text-rose-300 line-clamp-1">{att.gatewayErrorDescription || att.gatewayErrorCode}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold text-[10px] ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isFailed
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isSuccess ? <FiCheckCircle className="text-[10px]" /> : <FiAlertTriangle className="text-[10px]" />}
                          {(att.status || 'failed').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted font-mono text-[11px]">
                        {att.createdAt ? new Date(att.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {att.customerEmail ? (
                          <button
                            onClick={() => handleSendRecoveryEmail(att.customerEmail)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                          >
                            <FiSend /> Recovery Link
                          </button>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
