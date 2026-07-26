import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductForm from '../../../components/admin/ProductForm'
import { useProducts } from '../../../hooks/useProducts'

const parseList = (value) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

export default function EditProduct() {
  const { id } = useParams()
  const { products, updateProduct } = useProducts()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === id)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!product) return <div className="rounded-xl border border-white/10 bg-white/[0.055] p-8 text-text-muted">Product not found.</div>

  const onSubmit = async (data) => {
    setError('')
    setSaving(true)

    try {
      const patch = {
        title: data.title || 'Untitled',
        category: data.category || 'Uncategorized',
        thumbnail: data.thumbnail || '',
        screenshots: parseList(data.screenshots),
        demoVideo: data.demoVideo || '',
        description: data.description || '',
        features: parseList(data.features),
        price: Number(data.price) || 0,
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
        tags: parseList(data.tags),
        status: data.status || 'draft',
      }
      await updateProduct(id, patch)
      navigate('/admin/products')
    } catch (err) {
      setError(err.message || 'Unable to update product.')
    } finally {
      setSaving(false)
    }
  }

  const defaults = {
    title: product.title,
    category: product.category,
    thumbnail: product.thumbnail,
    screenshots: (product.screenshots || []).join(', '),
    demoVideo: product.demoVideo,
    description: product.description,
    features: (product.features || []).join(', '),
    price: product.price,
    discountPrice: product.discountPrice || '',
    tags: (product.tags || []).join(', '),
    status: product.status,
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
      <h2 className="mb-4 text-2xl font-bold text-white">Edit Product</h2>
      {error && <p className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      <ProductForm defaultValues={defaults} onSubmit={onSubmit} />
      {saving && <p className="mt-4 text-sm text-text-muted">Saving product...</p>}
    </div>
  )
}
