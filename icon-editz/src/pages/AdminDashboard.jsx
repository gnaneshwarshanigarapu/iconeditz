import { useEffect, useMemo, useState } from 'react'
import { productCategories } from '../data/products'
import {
  createSignedDownloadUrl,
  deleteProduct as removeProduct,
  getOrders,
  getProducts,
  getUsers,
  toggleProductPublish,
  uploadStorageFile,
  upsertProduct,
} from '../utils/supabase'

const DEFAULT_FORM = {
  id: null,
  title: '',
  slug: '',
  category: 'Effects Packs',
  thumbnailPath: '',
  thumbnailFile: null,
  previewFiles: [],
  previewUrls: [],
  demoVideo: '',
  description: '',
  features: '',
  version: '',
  price: '',
  discountPrice: '',
  productFilePath: '',
  productFile: null,
  tags: '',
  published: false,
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    recentOrders: [],
  })
  const [formState, setFormState] = useState(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [message, setMessage] = useState('')

  const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || ''

  const loadDashboard = async () => {
    try {
      const [productList = [], orders = [], users = []] = await Promise.all([
        getProducts(),
        getOrders(),
        getUsers(),
      ])

      const totalSales = orders.reduce((sum, order) => sum + Number(order.amount ?? 0), 0)
      const monthlyRevenue = orders.reduce((sum, order) => sum + Number(order.amount ?? 0), 0)
      const recentOrders = orders.slice(0, 5)

      setProducts(productList)
      setStats({
        totalSales,
        totalProducts: productList.length,
        totalCustomers: users.length,
        monthlyRevenue,
        recentOrders,
      })
    } catch (error) {
      console.error('Load dashboard error:', error)
      setMessage('Unable to load admin data. Check your Supabase configuration.')
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const resetForm = () => {
    setFormState(DEFAULT_FORM)
    setMessage('')
  }

  const selectProduct = (product) => {
    setFormState({
      id: product.id,
      title: product.title || '',
      slug: product.slug || '',
      category: product.category || 'Effects Packs',
      thumbnailPath: product.thumbnail || '',
      thumbnailFile: null,
      previewFiles: [],
      previewUrls: product.screenshots || [],
      demoVideo: product.demoVideo || '',
      description: product.description || '',
      features: (product.features || []).join('\n') || '',
      version: product.version || '',
      price: product.price?.toString() || '',
      discountPrice: product.discountPrice?.toString() || '',
      productFilePath: product.zipPath || '',
      productFile: null,
      zipPath: product.zipPath || '',
      googleDriveLink: product.googleDriveLink || '',
      onedriveLink: product.onedriveLink || '',
      dropboxLink: product.dropboxLink || '',
      tags: (product.tags || []).join(', '),
      published: product.published || false,
    })
    setActiveSection('products')
  }

  const updateField = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const uploadFiles = async (files, prefix) => {
    if (!storageBucket || files.length === 0) {
      return []
    }

    const uploaded = []
    for (const file of files) {
      const path = `${prefix}/${Date.now()}-${file.name}`
      const response = await uploadStorageFile(storageBucket, path, file)
      uploaded.push(response.path || path)
    }
    return uploaded
  }

  const handleSaveProduct = async (event) => {
    event.preventDefault()
    setMessage('')
    setIsSaving(true)

    try {
      const payload = {
        id: formState.id,
        title: formState.title,
        slug: formState.slug,
        category: formState.category,
        demo_video: formState.demoVideo,
        description: formState.description,
        features: formState.features,
        version: formState.version,
        price: Number(formState.price) || 0,
        discount_price: Number(formState.discountPrice) || 0,
        tags: formState.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        published: formState.published,
        thumbnail_url: formState.thumbnailPath,
        preview_urls: formState.previewUrls,
        product_file_path: formState.productFilePath,
      }

      if (storageBucket && formState.thumbnailFile) {
        const thumbnailPath = `products/${formState.slug || Date.now()}/thumbnail-${formState.thumbnailFile.name}`
        const result = await uploadStorageFile(storageBucket, thumbnailPath, formState.thumbnailFile)
        payload.thumbnail_url = result.path || thumbnailPath
      }

      if (storageBucket && formState.productFile) {
        const productFilePath = `products/${formState.slug || Date.now()}/files/${formState.productFile.name}`
        const result = await uploadStorageFile(storageBucket, productFilePath, formState.productFile)
        payload.product_file_path = result.path || productFilePath
      }

      if (storageBucket && formState.previewFiles.length) {
        const previewPaths = await uploadFiles(formState.previewFiles, `products/${formState.slug || Date.now()}/previews`)
        payload.preview_urls = [...(payload.preview_urls || []), ...previewPaths]
      }

      await upsertProduct(payload)
      setMessage('Product saved successfully.')
      resetForm()
      await loadDashboard()
    } catch (error) {
      console.error('Save product error:', error)
      setMessage(error.message || 'Unable to save the product. Please check your Supabase settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete product “${product.title}”? This cannot be undone.`)) {
      return
    }

    try {
      await removeProduct(product.id)
      setMessage('Product removed successfully.')
      await loadDashboard()
    } catch (error) {
      console.error('Delete product error:', error)
      setMessage('Unable to delete the product.')
    }
  }

  const handleTogglePublish = async (product) => {
    try {
      await toggleProductPublish(product.id, !product.published)
      setMessage(`Product ${product.published ? 'unpublished' : 'published'} successfully.`)
      await loadDashboard()
    } catch (error) {
      console.error('Publish toggle error:', error)
      setMessage('Unable to update publish state.')
    }
  }

  const secureDownloadUrl = async (path) => {
    if (!storageBucket || !path) {
      return null
    }
    try {
      const url = await createSignedDownloadUrl(storageBucket, path, 60 * 60)
      return url
    } catch (error) {
      console.error('Signed URL error:', error)
      return null
    }
  }

  const sectionClasses = (section) =>
    activeSection === section
      ? 'rounded-3xl bg-surface/95 px-6 py-4 shadow-lg border border-primary/10'
      : 'rounded-3xl border border-primary/10 bg-background/80 px-6 py-4'

  const statsCards = useMemo(
    () => [
      { label: 'Total sales', value: `$${stats.totalSales.toFixed(2)}` },
      { label: 'Products', value: stats.totalProducts },
      { label: 'Customers', value: stats.totalCustomers },
      { label: 'Monthly revenue', value: `$${stats.monthlyRevenue.toFixed(2)}` },
    ],
    [stats],
  )

  return (
    <div className="min-h-screen bg-background text-text px-4 py-24 md:px-8">
      <div className="container-custom space-y-8">
        <header className="rounded-[2rem] border border-primary/10 bg-surface/95 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Admin dashboard</p>
          <h1 className="mt-4 text-4xl font-bold">Icon Editz Product Management</h1>
          <p className="mt-2 max-w-2xl text-text-muted">Manage products, publish listings, and review recent order activity in a secure Supabase-backed admin workspace.</p>
        </header>

        {message && (
          <div className="rounded-3xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className={sectionClasses('overview')}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-primary">Overview</p>
                <h2 className="mt-3 text-2xl font-semibold">Business metrics</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl bg-background/80 px-4 py-2 text-sm text-text-muted">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Live Supabase sync
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {statsCards.map((card) => (
                <div key={card.label} className="rounded-3xl border border-primary/10 bg-background/90 p-6">
                  <p className="text-sm text-text-muted">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold">Recent orders</h3>
              <div className="mt-4 space-y-3">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div key={order.id || order.invoice_number} className="rounded-3xl border border-primary/10 bg-background/90 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold">{order.product_name || order.product_title || 'Unnamed product'}</p>
                          <p className="text-sm text-text-muted">Order #{order.invoice_number || order.id}</p>
                        </div>
                        <p className="text-sm font-semibold text-primary">${Number(order.amount ?? 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-muted">No recent orders available yet.</p>
                )}
              </div>
            </div>
          </section>

          <section className={sectionClasses('products')}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-primary">Product management</p>
                <h2 className="mt-3 text-2xl font-semibold">Add or update products</h2>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-primary/20 bg-background/90 px-4 py-2 text-sm text-text-muted transition hover:border-primary"
              >
                New product
              </button>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSaveProduct}>
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-text-muted">
                  Product title
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                    placeholder="Glitch Effects Pack"
                  />
                </label>
                <label className="space-y-2 text-sm text-text-muted">
                  Product slug
                  <input
                    type="text"
                    required
                    value={formState.slug}
                    onChange={(event) => updateField('slug', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                    placeholder="glitch-effects-pack"
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-2 text-sm text-text-muted">
                  Category
                  <select
                    value={formState.category}
                    onChange={(event) => updateField('category', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                  >
                    {productCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-text-muted">
                  Version
                  <input
                    type="text"
                    value={formState.version}
                    onChange={(event) => updateField('version', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                    placeholder="v1.0"
                  />
                </label>
                <label className="space-y-2 text-sm text-text-muted">
                  Published
                  <select
                    value={String(formState.published)}
                    onChange={(event) => updateField('published', event.target.value === 'true')}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                  >
                    <option value="false">Draft</option>
                    <option value="true">Published</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <label className="space-y-2 text-sm text-text-muted">
                  Regular price
                  <input
                    type="number"
                    value={formState.price}
                    onChange={(event) => updateField('price', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                    placeholder="49.99"
                  />
                </label>
                <label className="space-y-2 text-sm text-text-muted">
                  Discount price
                  <input
                    type="number"
                    value={formState.discountPrice}
                    onChange={(event) => updateField('discountPrice', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                    placeholder="29.99"
                  />
                </label>
                <label className="space-y-2 text-sm text-text-muted">
                  Demo video URL
                  <input
                    type="url"
                    value={formState.demoVideo}
                    onChange={(event) => updateField('demoVideo', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                    placeholder="https://youtu.be/..."
                  />
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-text-muted">
                  Tags (comma separated)
                  <input
                    type="text"
                    value={formState.tags}
                    onChange={(event) => updateField('tags', event.target.value)}
                    className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                    placeholder="glitch, motion, preset"
                  />
                </label>
                <label className="space-y-2 text-sm text-text-muted">
                  Thumbnail image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => updateField('thumbnailFile', event.target.files?.[0] || null)}
                    className="w-full text-sm text-text-muted"
                  />
                  {formState.thumbnailPath && <p className="text-xs text-text-muted">Current path: {formState.thumbnailPath}</p>}
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2 text-sm text-text-muted">
                  Preview images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => updateField('previewFiles', Array.from(event.target.files || []))}
                    className="w-full text-sm text-text-muted"
                  />
                </label>
                <label className="space-y-2 text-sm text-text-muted">
                  Product file (ZIP / RAR)
                  <input
                    type="file"
                    accept=".zip,.rar"
                    onChange={(event) => updateField('productFile', event.target.files?.[0] || null)}
                    className="w-full text-sm text-text-muted"
                  />
                  {formState.productFilePath && <p className="text-xs text-text-muted">Current file path: {formState.productFilePath}</p>}
                </label>
              </div>

              <label className="space-y-2 text-sm text-text-muted">
                Product description
                <textarea
                  required
                  value={formState.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="w-full min-h-[140px] rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                  placeholder="Write a compelling product description."
                />
              </label>

              <label className="space-y-2 text-sm text-text-muted">
                Product features
                <textarea
                  value={formState.features}
                  onChange={(event) => updateField('features', event.target.value)}
                  className="w-full min-h-[120px] rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                  placeholder="List product features separated by commas."
                />
              </label>

              <button
                type="submit"
                className="rounded-3xl bg-gradient-purple px-6 py-3 text-base font-semibold text-white transition hover:shadow-glow-purple-lg disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? 'Saving product...' : 'Save product'}
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-[2rem] border border-primary/10 bg-surface/95 p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-primary">Live catalog</p>
              <h2 className="mt-3 text-2xl font-semibold">Published products</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('products')}
              className="rounded-full border border-primary/10 bg-background/90 px-4 py-2 text-sm text-text-muted transition hover:border-primary"
            >
              Refresh list
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="flex flex-col gap-4 rounded-3xl border border-primary/10 bg-background/90 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">{product.title || 'Untitled product'}</p>
                    <p className="text-sm text-text-muted">{product.category || 'Uncategorized'}</p>
                    <p className="text-sm text-text-muted">Slug: {product.slug || 'n/a'}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(product)}
                      className="rounded-full border border-primary/15 bg-surface/80 px-4 py-2 text-sm text-text-muted transition hover:border-primary"
                    >
                      {product.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      className="rounded-full border border-red-300/60 bg-red-500/10 px-4 py-2 text-sm text-red-500 transition hover:bg-red-500/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted">No products are configured yet. Create one using the form above.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
