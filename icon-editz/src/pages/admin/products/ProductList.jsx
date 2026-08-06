import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiCheckCircle,
  FiRefreshCw,
  FiLink,
  FiBox,
} from 'react-icons/fi'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import { useProducts } from '../../../hooks/useProducts'
import { supabase } from '../../../utils/supabase'

export default function ProductList() {
  const navigate = useNavigate()
  const { getProducts, deleteProduct } = useProducts()

  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { products } = await getProducts()
      setItems(products || [])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteProduct(deleteTarget.id)
      setMessage(`✅ Product "${deleteTarget.title}" deleted successfully.`)
      setDeleteTarget(null)
      load()
    } catch (err) {
      setMessage(`🔴 Delete error: ${err.message}`)
    }
  }

  const handleCopyLink = (product) => {
    const url = `${window.location.origin}/store/${product.slug || product.id}`
    navigator.clipboard.writeText(url)
    setMessage(`✅ Public link copied: ${url}`)
  }

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [items])

  const filteredProducts = useMemo(() => {
    return items
      .filter((item) => {
        const text = `${item.title} ${item.slug || ''} ${item.category || ''}`.toLowerCase()
        const matchesQuery = text.includes(query.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
        return matchesQuery && matchesCategory
      })
      .sort((a, b) => {
        if (sortOrder === 'price_asc') return Number(a.price) - Number(b.price)
        if (sortOrder === 'price_desc') return Number(b.price) - Number(a.price)
        return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now())
      })
  }, [items, query, categoryFilter, sortOrder])

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Banner Box (Matches Screenshot 4) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Products</h1>
          <p className="mt-1 text-xs text-text-muted max-w-3xl leading-relaxed">
            Manage your product catalog. Products are stored in website CMS. Razorpay Orders are created automatically during checkout. Website checkout uses Razorpay Orders automatically. Payment Links are optional for manual sharing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/products/add')}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#8c46ff] px-6 py-3 text-xs font-bold text-white shadow-xl shadow-purple-600/30 hover:bg-[#7b35f0] hover:scale-[1.01] transition-all"
        >
          <FiPlus className="text-base" />
          <span>Add Product</span>
        </button>
      </div>

      {message && (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs font-semibold text-white shadow-lg">
          {message}
        </div>
      )}

      {/* Main Table Panel (Matches Screenshot 4) */}
      <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by title, slug, category..."
              className="w-full rounded-2xl border border-white/10 bg-[#0b0717]/80 px-4 py-2.5 text-xs text-white outline-none transition-all placeholder:text-text-muted/60 focus:border-primary/50"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0b0717]/80 px-4 py-2.5 text-xs text-white outline-none focus:border-primary/50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0b0717]/80 px-4 py-2.5 text-xs text-white outline-none focus:border-primary/50"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-text-muted">
          Showing {filteredProducts.length} of {items.length} products
        </p>

        {loading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">
            <FiBox className="mx-auto text-4xl text-white/20 mb-2" />
            <p className="font-bold text-white text-sm">No Products Found</p>
            <p className="mt-1">Add your first product or adjust search filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">THUMBNAIL</th>
                  <th className="py-3.5 px-4">PRODUCT TITLE</th>
                  <th className="py-3.5 px-4">PRICE</th>
                  <th className="py-3.5 px-4">SALE PRICE</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4">PAYMENT LINK</th>
                  <th className="py-3.5 px-4">CREATED/UPDATED</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => {
                  const isPublished = product.published || product.status === 'published'

                  return (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={product.thumbnail || '/assets/images/og-icon-editz.png'}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover border border-white/10"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-white text-xs">{product.title}</p>
                          <p className="text-[10px] text-text-muted font-mono">{product.slug || product.id}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-white">₹{product.price || 0}</td>

                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ₹{product.discountPrice || product.price || 0}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[10px] text-text-muted font-mono max-w-xs truncate">
                        {product.paymentLink || `https://rzp.io/rzp/${product.id.slice(0, 8)}`}
                      </td>

                      <td className="py-3 px-4 text-text-muted text-[11px]">
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/10 transition-all"
                          >
                            <FiEdit className="text-[10px]" /> Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
                          >
                            <FiTrash2 className="text-[10px]" /> Delete
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyLink(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-text-muted hover:text-white hover:bg-white/10 transition-all"
                            title="Copy Public Link"
                          >
                            <FiCopy className="text-[10px]" /> Copy
                          </button>

                          <button
                            type="button"
                            onClick={load}
                            className="p-1 rounded-lg border border-white/10 bg-white/5 text-text-muted hover:text-white"
                            title="Refresh"
                          >
                            <FiRefreshCw className="text-[10px]" />
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Product Asset"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="Delete Product"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
