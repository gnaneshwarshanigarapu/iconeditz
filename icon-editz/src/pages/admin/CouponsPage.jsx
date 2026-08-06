import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiTag, FiPlus, FiTrash2, FiEdit, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import { supabase } from '../../utils/supabase'

export default function CouponsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 20,
    min_amount: 0,
    max_discount: 500,
    usage_limit: 100,
    expires_at: '',
    status: 'active',
  })

  // Fetch coupons from Supabase
  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ['adminCouponsList'],
    queryFn: async () => {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      return data || []
    },
  })

  const handleSaveCoupon = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('coupons').upsert([formData])
      if (error) throw error
      setModalOpen(false)
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: 20,
        min_amount: 0,
        max_discount: 500,
        usage_limit: 100,
        expires_at: '',
        status: 'active',
      })
      refetch()
    } catch (err) {
      alert(`Save error: ${err.message}`)
    }
  }

  const handleDeleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    await supabase.from('coupons').delete().eq('id', id)
    refetch()
  }

  const filteredCoupons = coupons.filter((c) =>
    (c.code || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search coupons by code..."
        actionButtonText="Create Coupon"
        onActionClick={() => setModalOpen(true)}
      />

      {/* Coupons Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Active & Promotional Discount Coupons</h3>
            <p className="text-xs text-text-muted">Manage checkout codes, percentage discounts, fixed amounts & limits</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">No discount coupons found. Create your first coupon above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Type</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Usage Limit / Used</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id || coupon.code} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">{coupon.code}</td>
                    <td className="py-3.5 px-4 text-text-muted uppercase">{coupon.discount_type}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted font-mono">
                      {coupon.times_used || 0} / {coupon.usage_limit || '∞'}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-semibold text-emerald-400">
                        <FiCheckCircle className="text-[10px]" /> Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleSaveCoupon} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Create New Coupon Code</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-text-muted hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-text-muted mb-1 font-semibold">Coupon Code (Uppercase)</label>
              <input
                type="text"
                required
                placeholder="e.g. LAUNCH20"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-muted mb-1 font-semibold">Discount Type</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#170e30] px-3 py-2 text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">Value</label>
                <input
                  type="number"
                  required
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-muted mb-1 font-semibold">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-text-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2 font-bold text-white shadow-lg shadow-primary/25"
              >
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
