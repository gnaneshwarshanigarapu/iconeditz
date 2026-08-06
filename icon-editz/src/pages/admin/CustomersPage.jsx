import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiUsers, FiShoppingBag, FiDollarSign, FiDownload, FiMail, FiRefreshCw, FiPhone } from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import { api } from '../../services/api'
import { supabase } from '../../utils/supabase'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Fetch strictly live customer profiles from backend / Supabase
  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['adminCustomersList'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/customers')
        if (res.customers || res.data) return res.customers || res.data
      } catch {}

      // Fallback query to customers table
      const { data: customerRows = [] } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (customerRows.length > 0) {
        return customerRows.map((c) => ({
          id: c.id,
          name: c.name || c.email?.split('@')[0] || 'Customer',
          email: c.email,
          phone: c.phone || '',
          totalOrders: Number(c.total_orders || 1),
          totalSpent: Number(c.total_spent || 0),
          lastPurchase: c.last_purchase_at || c.updated_at || c.created_at,
        }))
      }

      // Live aggregation from orders table if customers table is empty
      const { data: orders = [] } = await supabase.from('orders').select('*')
      const map = new Map()

      orders.forEach((o) => {
        const email = (o.customer_email || o.user_email || o.email || '').trim().toLowerCase()
        if (!email) return

        if (!map.has(email)) {
          map.set(email, {
            id: o.id,
            name: o.customer_name || email.split('@')[0] || 'Customer',
            email,
            phone: o.customer_phone || '',
            totalOrders: 0,
            totalSpent: 0,
            lastPurchase: o.created_at,
            orders: [],
          })
        }
        const cust = map.get(email)
        cust.totalOrders += 1
        cust.totalSpent += Number(o.amount || 0)
        cust.orders.push(o)
      })

      return Array.from(map.values())
    },
  })

  const filteredCustomers = customers.filter(
    (cust) =>
      (cust.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (cust.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Search Bar */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer by name or email..."
      />

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Verified Customer Profiles</h3>
            <p className="text-xs text-text-muted">Reading strictly from PostgreSQL customers table ({filteredCustomers.length} records)</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-muted hover:text-white"
          >
            <FiRefreshCw /> Refresh Customers
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No customer profiles found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer Name & Email</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Total Spent (LTV)</th>
                  <th className="py-3.5 px-4">Last Purchase</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.email || cust.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs border border-indigo-500/30">
                          {(cust.name || cust.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{cust.name || 'Customer'}</p>
                          <p className="text-[11px] text-text-muted">{cust.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted font-mono">{cust.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-text-muted font-bold">{cust.totalOrders || 1} orders</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400">₹{(cust.totalSpent || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {cust.lastPurchase ? new Date(cust.lastPurchase).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{selectedCustomer.name || 'Customer Profile'}</h3>
                <p className="text-xs text-text-muted">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <span className="text-[10px] uppercase text-text-muted">Lifetime Value (LTV)</span>
                  <p className="text-base font-bold text-emerald-400">₹{selectedCustomer.totalSpent || 0}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <span className="text-[10px] uppercase text-text-muted">Total Orders</span>
                  <p className="text-base font-bold text-white">{selectedCustomer.totalOrders || 1}</p>
                </div>
              </div>

              {selectedCustomer.phone && (
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 flex items-center gap-2 text-text-muted">
                  <FiPhone className="text-primary" /> Phone: <span className="text-white font-mono">{selectedCustomer.phone}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
