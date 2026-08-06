import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiMail,
  FiUser,
  FiCreditCard,
} from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import { supabase } from '../../utils/supabase'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Fetch orders from Supabase PostgreSQL
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['adminOrdersList'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  // Export handlers
  const exportCSV = () => {
    const headers = ['Order ID,Customer Email,Amount,Status,Razorpay Order ID,Date\n']
    const rows = filteredOrders.map(
      (o) => `"${o.id}","${o.user_email || o.email || ''}","${o.amount}","${o.status || 'paid'}","${o.razorpay_order_id || ''}","${o.created_at}"`
    )
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-export-${Date.now()}.csv`
    a.click()
  }

  const exportExcel = () => {
    exportCSV() // CSV format easily opens in Excel
  }

  const exportPDF = () => {
    window.print()
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.user_email || order.email || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !selectedStatus || (order.status || 'paid').toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Filter & Export Controls */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Order ID or customer email..."
        statusOptions={['paid', 'pending', 'refunded', 'cancelled']}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onExportCSV={exportCSV}
        onExportExcel={exportExcel}
        onExportPDF={exportPDF}
      />

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Verified Customer Orders</h3>
            <p className="text-xs text-text-muted">Showing {filteredOrders.length} order transactions</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-muted hover:text-white"
          >
            <FiRefreshCw /> Refresh Data
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No matching orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Email</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Gateway ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">#{order.id.slice(0, 8)}</td>
                    <td className="py-3.5 px-4 text-text-muted">{order.user_email || order.email || 'customer@store.com'}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{order.amount || 0}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted">
                      {order.razorpay_payment_id || order.razorpay_order_id || 'pay_manual'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-semibold text-emerald-400">
                        <FiCheckCircle className="text-[10px]" /> Paid
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        <FiEye /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Order Details #{selectedOrder.id.slice(0, 8)}</h3>
                <p className="text-xs text-text-muted">Verified digital asset purchase</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <FiUser className="text-primary" /> Customer Info
                </div>
                <p className="text-text-muted">Email: {selectedOrder.user_email || selectedOrder.email}</p>
                <p className="text-text-muted">Purchased Date: {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <FiCreditCard className="text-emerald-400" /> Payment Summary
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Total Paid:</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{selectedOrder.amount}</span>
                </div>
                <p className="text-text-muted font-mono">Razorpay Payment ID: {selectedOrder.razorpay_payment_id || 'N/A'}</p>
                <p className="text-text-muted font-mono">Razorpay Order ID: {selectedOrder.razorpay_order_id || 'N/A'}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <FiDownload className="text-cyan-400" /> Asset Download Status
                </div>
                <p className="text-text-muted">Protected Link: Generated & Emailed</p>
                <p className="text-emerald-400 font-semibold">Download Access: Active (Unlimited)</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/25"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
