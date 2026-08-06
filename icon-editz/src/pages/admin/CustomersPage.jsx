import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiUsers, FiShoppingBag, FiDollarSign, FiDownload, FiMail, FiRefreshCw } from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import { supabase } from '../../utils/supabase'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // Fetch unique customers from orders table
  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['adminCustomersList'],
    queryFn: async () => {
      const { data: orders = [] } = await supabase.from('orders').select('*')
      
      const map = new Map()
      orders.forEach((o) => {
        const email = o.user_email || o.email || 'customer@store.com'
        if (!map.has(email)) {
          map.set(email, {
            email,
            ordersCount: 0,
            ltv: 0,
            lastOrderDate: o.created_at,
            orders: [],
          })
        }
        const cust = map.get(email)
        cust.ordersCount += 1
        cust.ltv += Number(o.amount || 0)
        cust.orders.push(o)
      })

      return Array.from(map.values())
    },
  })

  const filteredCustomers = customers.filter((cust) =>
    (cust.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer by email..."
      />

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Registered & Purchasing Customers</h3>
            <p className="text-xs text-text-muted">Calculated customer lifetime value (LTV) and download access</p>
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No customer profiles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer Email</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Lifetime Value (LTV)</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.email} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                        {cust.email[0].toUpperCase()}
                      </div>
                      <span>{cust.email}</span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted font-mono">{cust.ordersCount} orders</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{cust.ltv.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/10"
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

      {/* Customer Profile Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Customer Profile</h3>
                <p className="text-xs text-text-muted">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <span className="text-[10px] uppercase text-text-muted">Lifetime Value</span>
                  <p className="text-base font-bold text-emerald-400">₹{selectedCustomer.ltv}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <span className="text-[10px] uppercase text-text-muted">Total Orders</span>
                  <p className="text-base font-bold text-white">{selectedCustomer.ordersCount}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
                <p className="font-bold text-white mb-2">Order History</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedCustomer.orders.map((ord) => (
                    <div key={ord.id} className="flex items-center justify-between text-[11px] text-text-muted py-1 border-b border-white/5">
                      <span className="font-mono text-white">#{ord.id.slice(0, 8)}</span>
                      <span className="text-emerald-400 font-bold">₹{ord.amount}</span>
                      <span>{new Date(ord.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
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
