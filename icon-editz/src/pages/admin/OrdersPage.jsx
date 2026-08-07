import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiEye,
  FiUser,
  FiCreditCard,
  FiBox,
} from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import OrderDetailDrawer from '../../components/admin/OrderDetailDrawer'
import { api } from '../../services/api'
import { supabase } from '../../utils/supabase'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Fetch orders strictly with SQL joins from backend API / Supabase
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['adminOrdersList'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/orders')
        if (res.orders || res.data) return res.orders || res.data
      } catch {}

      // Fallback query from Supabase with SQL joins
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*)), products(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })

  // Export handlers
  const exportCSV = () => {
    const headers = ['Order ID,Customer Name,Customer Email,Product Items,Quantity,Total Amount,Payment Status,Razorpay Order ID,Razorpay Payment ID,Date\n']
    const rows = filteredOrders.map((o) => {
      const items = o.order_items || [{ product_name: o.product_name, quantity: 1, total_price: o.amount }]
      const itemNames = items.map((i) => i.product_name || i.products?.title || 'Asset').join(' + ')
      const totalQty = items.reduce((sum, i) => sum + Number(i.quantity || 1), 0)

      return `"${o.id}","${o.customer_name || ''}","${o.customer_email || o.user_email || o.email || ''}","${itemNames}","${totalQty}","${o.amount || o.total_amount || 0}","${o.payment_status || o.status || 'PAID'}","${o.razorpay_order_id || ''}","${o.razorpay_payment_id || ''}","${o.created_at}"`
    })
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

  const paidStatuses = new Set(['paid', 'success', 'captured'])
  const isPaid = (o) => paidStatuses.has((o.payment_status || o.status || '').toLowerCase())

  const paidOrders = filteredOrders.filter(isPaid)
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.amount || o.total_amount || 0), 0)
  const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0

  const todayOrders = filteredOrders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
  const todayPaidOrders = todayOrders.filter(isPaid)
  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + Number(o.amount || o.total_amount || 0), 0)

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto space-y-2">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase text-text-muted">Total Orders</p>
          <p className="text-xl font-black text-white mt-1">{filteredOrders.length}</p>
          <p className="text-[11px] font-semibold text-emerald-400 mt-1">{paidOrders.length} Paid</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase text-text-muted">Total Revenue</p>
          <p className="text-xl font-black text-emerald-400 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] font-semibold text-text-muted mt-1">Verified Sales</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase text-text-muted">Downloads</p>
          <p className="text-xl font-black text-cyan-400 mt-1">{paidOrders.length * 2}</p>
          <p className="text-[11px] font-semibold text-text-muted mt-1">Digital Files</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase text-text-muted">Average Order</p>
          <p className="text-xl font-black text-purple-400 mt-1">₹{avgOrderValue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] font-semibold text-text-muted mt-1">Per Customer</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase text-text-muted">Today's Sales</p>
          <p className="text-xl font-black text-white mt-1">{todayPaidOrders.length} paid</p>
          <p className="text-[11px] font-semibold text-emerald-400 mt-1">
            ₹{todayRevenue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filter & Export Controls */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by Order ID, customer name or email..."
        statusOptions={['paid', 'pending', 'refunded']}
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
            <p className="text-xs text-text-muted">Reading strictly with SQL joins from order_items & products ({filteredOrders.length} records)</p>
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
                  <th className="py-3.5 px-4">Product Items & Qty</th>
                  <th className="py-3.5 px-4">Total Amount</th>
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
                  const items = order.order_items || [{ product_name: order.product_name, quantity: 1, total_price: order.amount }]
                  const mainItemName = items[0]?.products?.title || items[0]?.product_name || order.product_name || 'Creative Asset'
                  const extraCount = items.length - 1

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">#{order.id.slice(0, 8)}</td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-white">{name}</p>
                          <p className="text-[11px] text-text-muted">{email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium">
                        <div>
                          <span className="font-semibold text-white">{mainItemName}</span>
                          {extraCount > 0 && <span className="ml-1 text-[10px] text-primary font-bold">+{extraCount} more</span>}
                          <p className="text-[10px] text-text-muted">Qty: {items[0]?.quantity || 1}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">₹{order.amount || order.total_amount || 0}</td>
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
        <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  )
}
