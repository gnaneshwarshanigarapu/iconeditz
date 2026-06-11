import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiBox,
  FiDownload,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiFolderPlus,
  FiPlus,
  FiShoppingBag,
  FiSlash,
  FiTrash2,
  FiTrendingUp,
} from 'react-icons/fi'
import { useProducts } from '../../hooks/useProducts'

const mockMetrics = {
  totalOrders: 24,
  totalRevenue: 42750,
  totalDownloads: 318,
}

const formatCurrency = (value) => `Rs.${value.toLocaleString('en-IN')}`

const statusStyles = {
  published: 'bg-green-500/15 text-green-300',
  draft: 'bg-yellow-500/15 text-yellow-300',
  archived: 'bg-slate-500/20 text-slate-300',
}

const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1)

export default function AdminDashboard() {
  const {
    products,
    productCounts,
    deleteProduct,
    publishProduct,
    unpublishProduct,
    archiveProduct,
  } = useProducts()
  const recentProducts = products.slice(0, 6)

  const stats = [
    { label: 'Total Products', value: productCounts.total, icon: FiBox, detail: 'All admin records' },
    { label: 'Published Products', value: productCounts.published, icon: FiEye, detail: 'Visible everywhere' },
    { label: 'Draft Products', value: productCounts.draft, icon: FiEyeOff, detail: 'Admin only' },
    { label: 'Archived Products', value: productCounts.archived, icon: FiSlash, detail: 'Kept in records' },
    { label: 'Total Orders', value: mockMetrics.totalOrders, icon: FiShoppingBag, detail: 'Mock orders' },
    { label: 'Total Revenue', value: formatCurrency(mockMetrics.totalRevenue), icon: FiTrendingUp, detail: 'Mock revenue' },
    { label: 'Total Downloads', value: mockMetrics.totalDownloads, icon: FiDownload, detail: 'Mock downloads' },
  ]

  const handleDelete = (product) => {
    if (window.confirm(`Delete "${product.title}"?`)) deleteProduct(product.id)
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{stat.detail}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/15 text-xl text-primary">
                  <Icon />
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-xl border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Store Pulse</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Creative assets are ready to sell</h2>
              <p className="mt-2 text-text-muted">Mock order data is displayed until the backend and payment phases are connected.</p>
            </div>
            <Link to="/store" className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-semibold text-white hover:bg-primary/25">
              View Store
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <Link to="/admin/products/add" className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover">
              <FiPlus />
              Add Product
            </Link>
            <Link to="/store" className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.08]">
              <FiEye />
              View Store
            </Link>
            <button
              type="button"
              onClick={() => window.alert('Category creation is mocked for now.')}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/[0.08]"
            >
              <FiFolderPlus />
              Create Category
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Products</h2>
            <p className="mt-1 text-sm text-text-muted">Manage pricing, visibility, and product updates.</p>
          </div>
          <Link to="/admin/products" className="text-sm font-semibold text-primary hover:text-primary-hover">
            View all products
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-text-muted">
              <tr>
                <th className="px-5 py-4 font-semibold">Thumbnail</th>
                <th className="px-5 py-4 font-semibold">Product Title</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-12 w-20 rounded-lg border border-white/10 object-cover"
                      onError={(event) => {
                        event.currentTarget.src = 'https://via.placeholder.com/160x90.png?text=Icon+Editz'
                      }}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{product.title}</p>
                    <p className="mt-1 text-xs text-text-muted">{product.tags?.slice(0, 2).join(', ')}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted">{product.category}</td>
                  <td className="px-5 py-4 font-semibold text-white">Rs.{product.discountPrice || product.price}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[product.status] || statusStyles.draft}`}>
                      {formatStatus(product.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${product.id}/edit`} className="rounded-lg border border-white/10 bg-white/[0.05] p-2 text-text-muted hover:text-white" aria-label={`Edit ${product.title}`}>
                        <FiEdit3 />
                      </Link>
                      {product.status === 'published' ? (
                        <button type="button" onClick={() => unpublishProduct(product.id)} className="rounded-lg border border-yellow-400/20 bg-yellow-500/10 p-2 text-yellow-200" aria-label={`Unpublish ${product.title}`}>
                          <FiEyeOff />
                        </button>
                      ) : (
                        <button type="button" onClick={() => publishProduct(product.id)} className="rounded-lg border border-green-400/20 bg-green-500/10 p-2 text-green-200" aria-label={`Publish ${product.title}`}>
                          <FiEye />
                        </button>
                      )}
                      {product.status !== 'archived' && (
                        <button type="button" onClick={() => archiveProduct(product.id)} className="rounded-lg border border-slate-400/20 bg-slate-500/10 p-2 text-slate-200" aria-label={`Archive ${product.title}`}>
                          <FiSlash />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(product)} className="rounded-lg border border-red-400/20 bg-red-500/10 p-2 text-red-200" aria-label={`Delete ${product.title}`}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {recentProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-text-muted">
                    No products yet. Add your first product to populate this dashboard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
