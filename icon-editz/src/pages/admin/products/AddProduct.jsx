import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductForm from '../../../components/admin/ProductForm'
import { useProducts } from '../../../hooks/useProducts'

const parseList = (value) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

export default function AddProduct() {
  const { addProduct } = useProducts()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data) => {
    setError('')
    setSaving(true)

    try {
      const product = {
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
        createdAt: new Date().toISOString(),
      }
      await addProduct(product)
      navigate('/admin/products')
    } catch (err) {
      setError(err.message || 'Unable to create product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
      <h2 className="mb-4 text-2xl font-bold text-white">Add Product</h2>
      {error && <p className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      <ProductForm onSubmit={onSubmit} />
      {saving && <p className="mt-4 text-sm text-text-muted">Saving product...</p>}
    </div>
  )
}
