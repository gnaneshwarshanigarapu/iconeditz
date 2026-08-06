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
  FiPhone,
} from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import { api } from '../../services/api'
import { supabase } from '../../utils/supabase'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Fetch orders strictly from backend API / Supabase orders table
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['adminOrdersList'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/orders')
        if (res.orders || res.data) return res.orders || res.data
      } catch {}
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  // Export handlers
  const exportCSV = () => {
    const headers = ['Order ID,Customer Name,Customer Email,Customer Phone,Amount,Status,Razorpay Order ID,Razorpay Payment ID,Date\n']
    const rows = filteredOrders.map(
      (o) =>
        `"${o.id}","${o.customer_name || ''}","${o.customer_email || o.user_email || o.email || ''}","${o.customer_phone || ''}","${o.amount}","${o.payment_status || o.status || 'PAID'}","${o.razorpay_order_id || ''}","${o.razorpay_payment_id || ''}","${o.created_at}"`
    )
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-export-${Date.now()}.csv`
    a.click()
  }

  const exportExcel = () => exportCSV()
  const exportPDF = () => window.print()

  const filteredOrders = orders.filter((order) => {
    const email = (order.customer_email || order.user_email || order.email || '').toLowerCase()
    const name = (order.customer_name || '').toLowerCase()
    const idStr = (order.id || '').toLowerCase()
    const statusStr = (order.payment_status || order.status || 'paid').toLowerCase()

    const matchesSearch = idStr.includes(search.toLowerCase()) || email.includes(search.toLowerCase()) || name.includes(search.toLowerCase())
    const matchesStatus = !selectedStatus || statusStr === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Filter & Export Controls */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Order ID, customer name or email..."
        statusOptions={['paid', 'pending', 'refunded', 'failed']}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onExportCSV={exportCSV}
        onExportExcel={exportExcel}
        onExportPDF={exportPDF}
      />

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Verified Customer Orders</h3>
            <p className="text-xs text-text-muted">Reading strictly from live PostgreSQL orders table ({filteredOrders.length} records)</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-muted hover:text-white"
          >
            <FiRefreshCw /> Refresh Orders
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No orders found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Name & Email</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Razorpay Payment ID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => {
                  const email = order.customer_email || order.user_email || order.email || ''
                  const name = order.customer_name || 'Customer'
                  const isPaid = (order.payment_status || order.status || 'PAID').toUpperCase() === 'PAID'

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">#{order.id.slice(0, 8)}</td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-white">{name}</p>
                          <p className="text-[11px] text-text-muted">{email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium">{order.product_name || 'Creative Asset'}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">₹{order.amount || 0}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted">
                        {order.razorpay_payment_id || order.razorpay_order_id || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold text-[10px] ${
                            isPaid
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          }`}
                        >
                          {isPaid ? <FiCheckCircle className="text-[10px]" /> : <FiClock className="text-[10px]" />}
                          {isPaid ? 'PAID' : 'PENDING'}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Order Details #{selectedOrder.id.slice(0, 8)}</h3>
                <p className="text-xs text-text-muted">Verified digital asset order from Supabase database</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <FiUser className="text-primary" /> Customer Info
                </div>
                <p className="text-white font-bold">{selectedOrder.customer_name || 'Customer'}</p>
                <p className="text-text-muted">Email: {selectedOrder.customer_email || selectedOrder.user_email || selectedOrder.email}</p>
                {selectedOrder.customer_phone && <p className="text-text-muted">Phone: {selectedOrder.customer_phone}</p>}
                <p className="text-text-muted">Purchased Date: {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-semibold mb-1">
                  <FiCreditCard className="text-emerald-400" /> Gateway & Payment Details
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Amount Paid:</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{selectedOrder.amount}</span>
                </div>
                <p className="text-text-muted font-mono">Payment Method: {selectedOrder.payment_method || 'Razorpay'}</p>
                <p className="text-text-muted font-mono">Razorpay Payment ID: {selectedOrder.razorpay_payment_id || 'N/A'}</p>
                <p className="text-text-muted font-mono">Razorpay Order ID: {selectedOrder.razorpay_order_id || 'N/A'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-lg shadow-primary/25"
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
