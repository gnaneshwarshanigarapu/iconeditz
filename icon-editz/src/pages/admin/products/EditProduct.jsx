import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductForm from '../../../components/admin/ProductForm'
import { useProducts } from '../../../hooks/useProducts'

const parseList = (value) =>
  typeof value === 'string'
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : Array.isArray(value)
    ? value
    : []

export default function EditProduct() {
  const { id } = useParams()
  const { getProduct, updateProduct } = useProducts()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    getProduct(id)
      .then((data) => {
        if (mounted) {
          if (data) setProduct(data)
          else setError('Product not found in database.')
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Error fetching product.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [getProduct, id])

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-8 text-center text-xs text-text-muted backdrop-blur-xl">
        Loading product asset details...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-8 text-center text-xs text-rose-300 backdrop-blur-xl">
        {error || 'Product asset not found.'}
      </div>
    )
  }

  const onSubmit = async (data) => {
    setError('')
    setSaving(true)

    try {
      const patch = {
        title: data.title || 'Untitled',
        slug: data.slug,
        category: data.category || 'Uncategorized',
        thumbnail: data.thumbnail || data.thumbnail_path || '',
        mainImage: data.mainImage || data.thumbnail || '',
        downloadUrl: data.downloadUrl || data.zip_path || '',
        downloadKey: data.downloadKey || data.download_key || data.r2_object_key || null,
        downloadFilename: data.downloadFilename || data.download_filename || null,
        storageProvider: data.storageProvider || data.storage_provider || 'r2',
        downloadType: data.downloadType || data.download_type || 'r2',
        fileSize: data.fileSize || data.file_size || null,
        contentType: data.contentType || data.content_type || null,
        screenshots: parseList(data.screenshots),
        demoVideo: data.demoVideo || data.demo_video || '',
        description: data.description || '',
        features: parseList(data.features),
        price: Number(data.price) || 0,
        discountPrice: data.discountPrice !== '' && data.discountPrice !== null && data.discountPrice !== undefined ? Number(data.discountPrice) : null,
        tags: parseList(data.tags),
        status: data.status || 'published',
      }
      console.log('[Product Update - Admin Submit]', patch)
      await updateProduct(id, patch)
      navigate('/admin/products')
    } catch (err) {
      setError(err.message || 'Unable to update product asset.')
    } finally {
      setSaving(false)
    }
  }

  const defaults = {
    title: product.title || '',
    slug: product.slug || '',
    category: product.category || '',
    thumbnail: product.thumbnail || product.thumbnail_path || '',
    mainImage: product.mainImage || product.thumbnail || product.thumbnail_path || '',
    downloadUrl: product.downloadUrl || product.zip_path || '',
    downloadKey: product.downloadKey || product.download_key || product.r2_object_key || '',
    downloadFilename: product.downloadFilename || product.download_filename || '',
    storageProvider: product.storageProvider || product.storage_provider || 'r2',
    fileSize: product.fileSize || product.file_size || '',
    contentType: product.contentType || product.content_type || '',
    screenshots: Array.isArray(product.screenshots) ? product.screenshots.join(', ') : product.screenshots || '',
    demoVideo: product.demoVideo || product.demo_video || '',
    description: product.description || '',
    features: Array.isArray(product.features) ? product.features.join(', ') : product.features || '',
    price: product.price ?? 0,
    discountPrice: product.discountPrice ?? product.discount_price ?? '',
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '',
    status: product.status || (product.published ? 'published' : 'draft'),
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-200">
          {error}
        </div>
      )}
      <ProductForm defaultValues={defaults} onSubmit={onSubmit} isEditing={true} />
      {saving && (
        <p className="text-center text-xs font-medium text-text-muted animate-pulse">
          Saving product asset to PostgreSQL database...
        </p>
      )}
    </div>
  )
}
