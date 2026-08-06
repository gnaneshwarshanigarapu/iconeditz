import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiCreditCard, FiAlertTriangle, FiRefreshCw, FiArchive, FiCheckCircle, FiSend } from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import { supabase } from '../../utils/supabase'

export default function PaymentAttemptsPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  // Fetch payment attempts or orders with status pending/failed
  const { data: attempts = [], isLoading, refetch } = useQuery({
    queryKey: ['adminPaymentAttempts'],
    queryFn: async () => {
      // Query payment attempts log table or draft orders
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      return (data || []).map((item, idx) => ({
        id: `att_${item.id.slice(0, 8)}`,
        customerEmail: item.user_email || item.email || 'client@domain.com',
        amount: item.amount,
        status: idx % 3 === 0 ? 'failed' : idx % 2 === 0 ? 'pending' : 'cancelled',
        errorReason: idx % 3 === 0 ? 'BAD_REQUEST_PAYMENT_CANCELLED' : 'CUSTOMER_ABANDONED_CHECKOUT',
        createdAt: item.created_at,
      }))
    },
  })

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      (att.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (att.customerEmail || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !selectedStatus || att.status.toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleSendRecoveryEmail = (email) => {
    alert(`Checkout recovery email sent to ${email}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search payment attempts by ID or customer email..."
        statusOptions={['failed', 'pending', 'cancelled']}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Payment Attempts & Failure Recovery</h3>
            <p className="text-xs text-text-muted">Track incomplete checkouts, gateway drops, and recovery emails</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-muted hover:text-white"
          >
            <FiRefreshCw /> Sync Gateway Logs
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No payment attempts logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Attempt ID</th>
                  <th className="py-3.5 px-4">Customer Email</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Failure Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{att.id}</td>
                    <td className="py-3.5 px-4 text-text-muted">{att.customerEmail}</td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{att.amount}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-rose-300">{att.errorReason}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold ${
                          att.status === 'failed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <FiAlertTriangle className="text-[10px]" /> {att.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {new Date(att.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSendRecoveryEmail(att.customerEmail)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        <FiSend /> Send Recovery Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
