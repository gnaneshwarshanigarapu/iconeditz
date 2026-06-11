import React from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../../hooks/useProducts'

const statusStyles = {
  published: 'bg-green-500/15 text-green-300',
  draft: 'bg-yellow-500/15 text-yellow-300',
  archived: 'bg-slate-500/20 text-slate-300',
}

const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1)

export default function ProductList() {
  const { products, productCounts, deleteProduct, publishProduct, unpublishProduct, archiveProduct } = useProducts()

  const handleDelete = (product) => {
    if (window.confirm(`Delete "${product.title}"?`)) deleteProduct(product.id)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
          <p className="mt-1 text-sm text-text-muted">
            Total {productCounts.total} - Published {productCounts.published} - Draft {productCounts.draft} - Archived {productCounts.archived}
          </p>
        </div>
        <Link to="/admin/products/add" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.length === 0 && <p className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-text-muted">No products yet.</p>}
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.065]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-16 w-24 rounded-lg border border-white/10 object-cover"
                  onError={(event) => {
                    event.currentTarget.src = 'https://via.placeholder.com/160x90.png?text=Icon+Editz'
                  }}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-white">{product.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[product.status] || statusStyles.draft}`}>
                      {formatStatus(product.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {product.category} - Rs.{product.discountPrice || product.price}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {product.status === 'published' ? (
                  <button className="text-sm font-semibold text-yellow-300" onClick={() => unpublishProduct(product.id)}>
                    Draft
                  </button>
                ) : (
                  <button className="text-sm font-semibold text-green-300" onClick={() => publishProduct(product.id)}>
                    Publish
                  </button>
                )}
                {product.status !== 'archived' && (
                  <button className="text-sm font-semibold text-slate-300" onClick={() => archiveProduct(product.id)}>
                    Archive
                  </button>
                )}
                <Link to={`/admin/products/${product.id}/edit`} className="text-sm font-semibold text-primary">
                  Edit
                </Link>
                <button className="text-sm font-semibold text-red-300" onClick={() => handleDelete(product)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
