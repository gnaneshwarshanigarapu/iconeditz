import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiCheckCircle,
  FiEye,
  FiRefreshCw,
  FiBox,
} from 'react-icons/fi'
import DataFilterBar from '../../../components/admin/DataFilterBar'
import ConfirmDialog from '../../../components/admin/ConfirmDialog'
import { useProducts } from '../../../hooks/useProducts'
import { supabase } from '../../../utils/supabase'

export default function ProductList() {
  const navigate = useNavigate()
  const { getProducts, deleteProduct, publishProduct, unpublishProduct } = useProducts()

  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('newest')
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

  const duplicateProduct = async (product) => {
    try {
      const copy = {
        title: `${product.title} (Copy)`,
        category: product.category,
        thumbnail: product.thumbnail,
        screenshots: product.screenshots,
        demoVideo: product.demoVideo,
        downloadUrl: product.downloadUrl,
        description: product.description,
        features: product.features,
        price: product.price,
        discountPrice: product.discountPrice,
        tags: product.tags,
        status: 'draft',
        published: false,
      }
      const { error } = await supabase.from('products').insert([copy])
      if (error) throw error
      setMessage('✅ Product duplicated as Draft successfully!')
      load()
    } catch (err) {
      setMessage(`🔴 Duplicate error: ${err.message}`)
    }
  }

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

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean))
    return Array.from(set)
  }, [items])

  const filteredProducts = useMemo(() => {
    return items
      .filter((item) => {
        const matchesQuery = `${item.title} ${item.category} ${item.tags}`.toLowerCase().includes(query.toLowerCase())
        const matchesCategory = !categoryFilter || item.category === categoryFilter
        const matchesStatus =
          !statusFilter ||
          (statusFilter === 'published' ? item.published || item.status === 'published' : !item.published && item.status !== 'published')
        return matchesQuery && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sort === 'price') return Number(a.price) - Number(b.price)
        return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now())
      })
  }, [items, query, categoryFilter, statusFilter, sort])

  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter Bar */}
      <DataFilterBar
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search products by title, category or tags..."
        categories={categories}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusOptions={['published', 'draft']}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        actionButtonText="Add Product"
        onActionClick={() => navigate('/admin/products/add')}
      />

      {message && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-xs font-semibold text-white">
          {message}
        </div>
      )}

      {/* Product List Table */}
      <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Digital Product Catalog</h3>
            <p className="text-xs text-text-muted">Showing {filteredProducts.length} assets</p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-muted hover:text-white"
          >
            <FiRefreshCw /> Refresh List
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">
            <FiBox className="mx-auto text-4xl text-white/20 mb-2" />
            <p className="font-bold text-white text-sm">No Products Found</p>
            <p className="mt-1">Add your first product asset or adjust search filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / Discount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => {
                  const isPublished = product.published || product.status === 'published'

                  return (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnail || '/assets/images/og-icon-editz.png'}
                            alt=""
                            className="h-12 w-16 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <p className="font-bold text-white text-sm">{product.title}</p>
                            <p className="text-[10px] text-text-muted truncate max-w-xs">{product.tags || 'Digital Asset'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-text-muted">
                        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs border border-white/10 font-medium">
                          {product.category || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-emerald-400">
                            ₹{product.discountPrice || product.price}
                          </span>
                          {product.discountPrice && (
                            <span className="text-[10px] text-text-muted line-through">₹{product.price}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          <FiCheckCircle className="text-[10px]" /> {isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => duplicateProduct(product)}
                            className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                            title="Duplicate Product"
                          >
                            <FiCopy />
                          </button>

                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
                            title="Edit Product"
                          >
                            <FiEdit2 />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="p-2 rounded-lg bg-red-500/10 text-rose-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            title="Delete Product"
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
