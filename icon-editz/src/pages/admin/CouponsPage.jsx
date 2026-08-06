import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FiTag,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiPercent,
  FiDollarSign,
  FiList,
  FiCheckSquare,
  FiSave,
  FiRotateCcw,
  FiSearch,
  FiBox,
  FiLayers,
} from 'react-icons/fi'
import DataFilterBar from '../../components/admin/DataFilterBar'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { supabase } from '../../utils/supabase'

export default function CouponsPage() {
  const [activeView, setActiveView] = useState('create') // 'create' or 'list'
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saveNotice, setSaveNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Selection box filter search
  const [productSearch, setProductSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')

  const initialForm = {
    offer_name: '',
    code: '',
    description: '',
    admin_notes: '',
    discount_value: 10,
    max_discount: '',
    min_amount: '',
    usage_limit: '',
    usage_limit_per_customer: 1,
    discount_type: 'percentage',
    applies_to: 'all_products', // 'all_products', 'specific_products', 'specific_categories'
    applicable_product_ids: [],
    applicable_categories: [],
    active_immediately: true,
    first_purchase_only: false,
    new_customers_only: false,
    exclude_free_products: false,
    exclude_sale_products: false,
    allow_stacking: false,
  }

  const [formData, setFormData] = useState(initialForm)

  // Fetch existing coupons from Supabase
  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ['adminCouponsList'],
    queryFn: async () => {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      return data || []
    },
  })

  // Fetch available products catalog for selection
  const { data: productsList = [] } = useQuery({
    queryKey: ['adminProductsSelectionList'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, title, category, price, discountPrice, thumbnail').order('created_at', { ascending: false })
      return data || []
    },
  })

  // Available unique categories
  const categoriesList = useMemo(() => {
    const set = new Set(productsList.map((p) => p.category).filter(Boolean))
    return Array.from(set)
  }, [productsList])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEdit = (coupon) => {
    setEditingId(coupon.id)
    setFormData({
      offer_name: coupon.offer_name || '',
      code: coupon.code || '',
      description: coupon.description || '',
      admin_notes: coupon.admin_notes || '',
      discount_value: coupon.discount_value || coupon.discount_percentage || 10,
      max_discount: coupon.max_discount || '',
      min_amount: coupon.min_amount || coupon.min_cart_amount || '',
      usage_limit: coupon.usage_limit || coupon.total_usage_limit || '',
      usage_limit_per_customer: coupon.usage_limit_per_customer || 1,
      discount_type: coupon.discount_type || 'percentage',
      applies_to: coupon.applies_to || 'all_products',
      applicable_product_ids: Array.isArray(coupon.applicable_product_ids) ? coupon.applicable_product_ids : [],
      applicable_categories: Array.isArray(coupon.applicable_categories) ? coupon.applicable_categories : [],
      active_immediately: coupon.active_immediately ?? true,
      first_purchase_only: coupon.first_purchase_only ?? false,
      new_customers_only: coupon.new_customers_only ?? false,
      exclude_free_products: coupon.exclude_free_products ?? false,
      exclude_sale_products: coupon.exclude_sale_products ?? false,
      allow_stacking: coupon.allow_stacking ?? false,
    })
    setActiveView('create')
  }

  const toggleProductSelection = (productId) => {
    setFormData((prev) => {
      const current = prev.applicable_product_ids || []
      const exists = current.includes(productId)
      const updated = exists ? current.filter((id) => id !== productId) : [...current, productId]
      return { ...prev, applicable_product_ids: updated }
    })
  }

  const toggleCategorySelection = (categoryName) => {
    setFormData((prev) => {
      const current = prev.applicable_categories || []
      const exists = current.includes(categoryName)
      const updated = exists ? current.filter((cat) => cat !== categoryName) : [...current, categoryName]
      return { ...prev, applicable_categories: updated }
    })
  }

  const selectAllVisibleProducts = () => {
    const visibleIds = filteredProductsSelection.map((p) => p.id)
    setFormData((prev) => {
      const set = new Set([...(prev.applicable_product_ids || []), ...visibleIds])
      return { ...prev, applicable_product_ids: Array.from(set) }
    })
  }

  const clearProductSelection = () => {
    setFormData((prev) => ({ ...prev, applicable_product_ids: [] }))
  }

  const selectAllVisibleCategories = () => {
    setFormData((prev) => ({ ...prev, applicable_categories: [...filteredCategoriesSelection] }))
  }

  const clearCategorySelection = () => {
    setFormData((prev) => ({ ...prev, applicable_categories: [] }))
  }

  const handleSaveCoupon = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSaveNotice('')

    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        offer_name: formData.offer_name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        admin_notes: formData.admin_notes,
        discount_value: Number(formData.discount_value || 0),
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        min_amount: formData.min_amount ? Number(formData.min_amount) : 0,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        usage_limit_per_customer: formData.usage_limit_per_customer ? Number(formData.usage_limit_per_customer) : 1,
        discount_type: formData.discount_type,
        applies_to: formData.applies_to,
        applicable_product_ids: formData.applicable_product_ids,
        applicable_categories: formData.applicable_categories,
        active_immediately: Boolean(formData.active_immediately),
        first_purchase_only: Boolean(formData.first_purchase_only),
        new_customers_only: Boolean(formData.new_customers_only),
        exclude_free_products: Boolean(formData.exclude_free_products),
        exclude_sale_products: Boolean(formData.exclude_sale_products),
        allow_stacking: Boolean(formData.allow_stacking),
        status: formData.active_immediately ? 'active' : 'draft',
      }

      const { error } = await supabase.from('coupons').upsert([payload])
      if (error) throw error

      setSaveNotice(`✅ Coupon code "${formData.code.toUpperCase()}" saved successfully!`)
      setEditingId(null)
      setFormData(initialForm)
      refetch()
    } catch (err) {
      setSaveNotice(`🔴 Error saving coupon: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCoupon = async () => {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', deleteTarget.id)
      if (error) throw error
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      alert(`Delete error: ${err.message}`)
    }
  }

  const filteredCoupons = coupons.filter(
    (c) =>
      (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.offer_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredProductsSelection = productsList.filter((p) =>
    (p.title || '').toLowerCase().includes(productSearch.toLowerCase())
  )

  const filteredCategoriesSelection = categoriesList.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const selectedCount =
    formData.applies_to === 'specific_products'
      ? (formData.applicable_product_ids || []).length
      : formData.applies_to === 'specific_categories'
      ? (formData.applicable_categories || []).length
      : 0

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-[#0e081f]/90 px-4 py-3 text-xs text-white outline-none transition-all placeholder:text-text-muted/60 focus:border-primary/50 focus:bg-white/[0.06]'
  const labelClass = 'mb-1.5 block text-xs font-semibold text-text-muted/90'

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#120c24]/80 p-5 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
              Promotional Engine
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Coupons & Offers</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Configure promotional discount codes, usage constraints, customer restrictions and cart rules.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveView('create')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeView === 'create'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <FiPlus /> {editingId ? 'Edit Offer' : 'Create Offer'}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('list')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeView === 'list'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <FiList /> All Coupons ({coupons.length})
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs font-semibold text-white shadow-lg">
          {saveNotice}
        </div>
      )}

      {/* CREATE / EDIT FORM VIEW */}
      {activeView === 'create' && (
        <form
          onSubmit={handleSaveCoupon}
          className="rounded-2xl border border-white/10 bg-[#120c24]/90 p-6 shadow-2xl backdrop-blur-xl space-y-5 text-xs"
        >
          {/* Row 1: Offer name & Coupon code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Offer name</label>
              <input
                type="text"
                placeholder="e.g. Festival Launch Discount"
                value={formData.offer_name}
                onChange={(e) => handleChange('offer_name', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Coupon code *</label>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE20"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                className={`${inputClass} font-mono uppercase font-bold text-emerald-400`}
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className={labelClass}>Description</label>
            <input
              type="text"
              placeholder="e.g. Get 10% instant discount on all Instagram Reels and Motion templates"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Row 3: Internal admin notes */}
          <div>
            <label className={labelClass}>Internal admin notes</label>
            <input
              type="text"
              placeholder="e.g. Approved for Diwali marketing campaign"
              value={formData.admin_notes}
              onChange={(e) => handleChange('admin_notes', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Row 4: Discount percentage & Maximum discount */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                {formData.discount_type === 'percentage' ? 'Discount percentage (%)' : 'Discount amount (₹)'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.discount_value}
                onChange={(e) => handleChange('discount_value', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Maximum discount (₹)</label>
              <input
                type="number"
                step="1"
                placeholder="Leave blank for no limit"
                value={formData.max_discount}
                onChange={(e) => handleChange('max_discount', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 5: Minimum cart amount & Total usage limit */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Minimum cart amount (₹)</label>
              <input
                type="number"
                step="1"
                placeholder="0"
                value={formData.min_amount}
                onChange={(e) => handleChange('min_amount', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Total usage limit</label>
              <input
                type="number"
                step="1"
                placeholder="Leave blank for unlimited"
                value={formData.usage_limit}
                onChange={(e) => handleChange('usage_limit', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 6: Usage limit per customer & Discount type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Usage limit per customer</label>
              <input
                type="number"
                step="1"
                value={formData.usage_limit_per_customer}
                onChange={(e) => handleChange('usage_limit_per_customer', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Discount type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => handleChange('discount_type', e.target.value)}
                className={inputClass}
              >
                <option value="percentage">Percentage discount</option>
                <option value="fixed">Fixed amount discount</option>
                <option value="free_shipping">Free shipping</option>
              </select>
            </div>
          </div>

          {/* Row 7: Applies to (with selection counter) */}
          <div>
            <label className={labelClass}>
              Applies to ({selectedCount} selected)
            </label>
            <select
              value={formData.applies_to}
              onChange={(e) => handleChange('applies_to', e.target.value)}
              className={inputClass}
            >
              <option value="all_products">All products</option>
              <option value="specific_products">Selected products</option>
              <option value="specific_categories">Selected categories</option>
            </select>
          </div>

          {/* DYNAMIC PRODUCT SELECTION BOX (Matches Screenshot Exactly) */}
          {formData.applies_to === 'specific_products' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0518]/90 p-4 space-y-3 backdrop-blur-xl">
              {/* Header & Quick Action Links */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FiBox className="text-primary" /> Select products
                </h4>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-purple-400">
                  <button
                    type="button"
                    onClick={selectAllVisibleProducts}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Select all visible
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={clearProductSelection}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              </div>

              {/* Inner Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#120a26]/90 px-4 py-2.5 text-xs text-white outline-none placeholder:text-text-muted/60 focus:border-primary/50"
                />
              </div>

              {/* Scrollable Product List */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5">
                {filteredProductsSelection.length === 0 ? (
                  <div className="py-6 text-center text-xs text-text-muted">No products found matching query.</div>
                ) : (
                  filteredProductsSelection.map((product) => {
                    const isSelected = (formData.applicable_product_ids || []).includes(product.id)

                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary accent-primary"
                          />
                          <img
                            src={product.thumbnail || '/assets/images/og-icon-editz.png'}
                            alt=""
                            className="h-9 w-9 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{product.title}</p>
                            <p className="text-[10px] text-text-muted">{product.category || 'General'}</p>
                          </div>
                        </div>

                        <span className="font-bold text-emerald-400 text-xs">
                          ₹{product.discountPrice || product.price || 0}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* DYNAMIC CATEGORY SELECTION BOX */}
          {formData.applies_to === 'specific_categories' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0518]/90 p-4 space-y-3 backdrop-blur-xl">
              {/* Header & Quick Actions */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FiLayers className="text-primary" /> Select categories
                </h4>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-purple-400">
                  <button
                    type="button"
                    onClick={selectAllVisibleCategories}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Select all visible
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={clearCategorySelection}
                    className="hover:text-purple-300 transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#120a26]/90 px-4 py-2.5 text-xs text-white outline-none placeholder:text-text-muted/60 focus:border-primary/50"
                />
              </div>

              {/* Scrollable List */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5">
                {filteredCategoriesSelection.length === 0 ? (
                  <div className="py-6 text-center text-xs text-text-muted">No categories available.</div>
                ) : (
                  filteredCategoriesSelection.map((cat) => {
                    const isSelected = (formData.applicable_categories || []).includes(cat)

                    return (
                      <div
                        key={cat}
                        onClick={() => toggleCategorySelection(cat)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary accent-primary"
                          />
                          <span className="font-bold text-white text-xs">{cat}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Checkboxes Row 1 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-white select-none">
              <input
                type="checkbox"
                checked={formData.active_immediately}
                onChange={(e) => handleChange('active_immediately', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/20 accent-primary"
              />
              Active immediately
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-white select-none">
              <input
                type="checkbox"
                checked={formData.first_purchase_only}
                onChange={(e) => handleChange('first_purchase_only', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/20 accent-primary"
              />
              First purchase only
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-white select-none">
              <input
                type="checkbox"
                checked={formData.new_customers_only}
                onChange={(e) => handleChange('new_customers_only', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/20 accent-primary"
              />
              New customers only
            </label>
          </div>

          {/* Checkboxes Row 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-1 border-t border-white/5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-white select-none">
              <input
                type="checkbox"
                checked={formData.exclude_free_products}
                onChange={(e) => handleChange('exclude_free_products', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/20 accent-primary"
              />
              Exclude free products
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-white select-none">
              <input
                type="checkbox"
                checked={formData.exclude_sale_products}
                onChange={(e) => handleChange('exclude_sale_products', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/20 accent-primary"
              />
              Exclude sale products
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-white select-none">
              <input
                type="checkbox"
                checked={formData.allow_stacking}
                onChange={(e) => handleChange('allow_stacking', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/20 accent-primary"
              />
              Allow coupon stacking
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setFormData(initialForm)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-bold text-text-muted hover:text-white hover:bg-white/10 transition-all"
            >
              <FiRotateCcw /> Reset Form
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.01] transition-all disabled:opacity-50"
            >
              <FiSave /> {isSubmitting ? 'Saving Offer...' : editingId ? 'Update Offer' : 'Save Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* LIST TABLE VIEW */}
      {activeView === 'list' && (
        <div className="flex flex-col gap-4">
          <DataFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search offer name or coupon code..."
            actionButtonText="Create Offer"
            onActionClick={() => {
              setEditingId(null)
              setFormData(initialForm)
              setActiveView('create')
            }}
          />

          <div className="rounded-2xl border border-white/10 bg-[#120c24]/90 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Active & Promotional Discount Coupons</h3>
                <p className="text-xs text-text-muted">Manage active discount rules, usage logs, and status triggers</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                No discount coupons found. Click "Create Offer" above to create your first coupon!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                      <th className="py-3.5 px-4">Offer / Code</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Value</th>
                      <th className="py-3.5 px-4">Applies To</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCoupons.map((coupon) => {
                      const isPct = (coupon.discount_type || 'percentage') === 'percentage'
                      const valStr = isPct
                        ? `${coupon.discount_value || coupon.discount_percentage || 0}% OFF`
                        : `₹${coupon.discount_value || coupon.discount_amount || 0} OFF`

                      const appliesText =
                        coupon.applies_to === 'specific_products'
                          ? `${(coupon.applicable_product_ids || []).length} Products`
                          : coupon.applies_to === 'specific_categories'
                          ? `${(coupon.applicable_categories || []).length} Categories`
                          : 'All Products'

                      return (
                        <tr key={coupon.id || coupon.code} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-mono font-bold text-emerald-400 text-sm">{coupon.code}</p>
                              <p className="text-text-muted text-[11px] font-semibold">{coupon.offer_name || 'General Offer'}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-text-muted uppercase font-medium">
                            {coupon.discount_type || 'percentage'}
                          </td>

                          <td className="py-3.5 px-4 font-bold text-white">{valStr}</td>

                          <td className="py-3.5 px-4 text-text-muted font-semibold text-[11px]">
                            <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1">
                              {appliesText}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold text-[10px] ${
                                coupon.active_immediately !== false && coupon.status !== 'draft'
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                              }`}
                            >
                              <FiCheckCircle className="text-[10px]" />{' '}
                              {coupon.active_immediately !== false && coupon.status !== 'draft' ? 'ACTIVE' : 'DRAFT'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(coupon)}
                                className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                                title="Edit Offer"
                              >
                                <FiEdit />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget(coupon)}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                                title="Delete Offer"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
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
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Coupon Offer"
        message={`Are you sure you want to delete coupon code "${deleteTarget?.code}"? This cannot be undone.`}
        confirmText="Delete Coupon"
        onConfirm={handleDeleteCoupon}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
