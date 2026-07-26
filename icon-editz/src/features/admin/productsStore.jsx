import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { products as seedProducts, productCategories } from '../../data/products'

const STORAGE_KEY = 'icon-editz.products.v1'
const PRODUCT_STATUSES = ['draft', 'published', 'archived']

const ProductsContext = createContext(null)

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

const toList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const toNullableNumber = (value) => {
  if (value === '' || value === undefined || value === null) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const toProductImage = (value) => {
  if (!value || String(value).includes(['placeholder', 'com'].join('.'))) return ''
  return value
}

const createProductId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const normalizeStatus = (product = {}) => {
  if (PRODUCT_STATUSES.includes(product.status)) return product.status
  return product.published ? 'published' : 'draft'
}

const normalizeProduct = (product = {}) => {
  const status = normalizeStatus(product)
  const image = toProductImage(product.image || product.thumbnail || product.thumbnailPath)

  return {
    id: product.id || createProductId(),
    title: product.title?.trim() || 'Untitled Product',
    category: product.category?.trim() || 'Uncategorized',
    image,
    thumbnail: image,
    screenshots: toList(product.screenshots),
    demoVideo: product.demoVideo || product.demo_video || '',
    description: product.description || '',
    features: toList(product.features),
    price: Number(product.price) || 0,
    discountPrice: toNullableNumber(product.discountPrice ?? product.discount_price),
    tags: toList(product.tags),
    status,
    published: status === 'published',
    createdAt: product.createdAt || product.created_at || new Date().toISOString(),
  }
}

const initialProducts = seedProducts.map((product) =>
  normalizeProduct({
    ...product,
    status: product.status || (product.published === false ? 'draft' : 'published'),
    features: product.features || ['Instant download', 'Works with popular editing tools', 'Easy to customize'],
  }),
)

const readStoredProducts = () => {
  if (!canUseStorage()) return initialProducts

  try {
    const rawProducts = window.localStorage.getItem(STORAGE_KEY)
    if (!rawProducts) return initialProducts

    const parsedProducts = JSON.parse(rawProducts)
    if (!Array.isArray(parsedProducts)) return initialProducts

    return parsedProducts.map(normalizeProduct)
  } catch (error) {
    console.warn('Unable to load stored products:', error)
    return initialProducts
  }
}

const writeStoredProducts = (products) => {
  if (!canUseStorage()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (error) {
    console.warn('Unable to save products:', error)
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(readStoredProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    writeStoredProducts(products)
  }, [products])

  useEffect(() => {
    if (!canUseStorage()) return undefined

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return

      try {
        const nextProducts = JSON.parse(event.newValue)
        if (Array.isArray(nextProducts)) setProducts(nextProducts.map(normalizeProduct))
      } catch (storageError) {
        console.warn('Unable to sync products from storage:', storageError)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const storedProducts = readStoredProducts()
      setProducts(storedProducts)
      return storedProducts
    } catch (refreshError) {
      setError(refreshError.message || 'Unable to load products.')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const addProduct = useCallback(async (product) => {
    const savedProduct = normalizeProduct({
      ...product,
      id: product.id || createProductId(),
      createdAt: product.createdAt || new Date().toISOString(),
    })

    setProducts((currentProducts) => [savedProduct, ...currentProducts.filter((item) => item.id !== savedProduct.id)])
    return savedProduct
  }, [])

  const updateProduct = useCallback(async (id, patch) => {
    let savedProduct = null

    setProducts((currentProducts) => {
      const existingProduct = currentProducts.find((product) => product.id === id)
      if (!existingProduct) throw new Error('Product not found.')

      savedProduct = normalizeProduct({
        ...existingProduct,
        ...patch,
        id,
        createdAt: existingProduct.createdAt,
      })

      return currentProducts.map((product) => (product.id === id ? savedProduct : product))
    })

    return savedProduct
  }, [])

  const deleteProduct = useCallback(async (id) => {
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== id))
  }, [])

  const setProductStatus = useCallback((id, status) => {
    if (!PRODUCT_STATUSES.includes(status)) throw new Error('Invalid product status.')
    return updateProduct(id, { status })
  }, [updateProduct])

  const publishProduct = useCallback((id) => setProductStatus(id, 'published'), [setProductStatus])
  const unpublishProduct = useCallback((id) => setProductStatus(id, 'draft'), [setProductStatus])
  const archiveProduct = useCallback((id) => setProductStatus(id, 'archived'), [setProductStatus])

  const value = useMemo(() => {
    const categories = Array.from(new Set([...productCategories, ...products.map((product) => product.category)])).filter(Boolean)
    const publishedProducts = products.filter((product) => product.status === 'published')
    const draftProducts = products.filter((product) => product.status === 'draft')
    const archivedProducts = products.filter((product) => product.status === 'archived')
    const publishedCategories = Array.from(new Set([...productCategories, ...publishedProducts.map((product) => product.category)])).filter(Boolean)
    const productCounts = {
      total: products.length,
      published: publishedProducts.length,
      draft: draftProducts.length,
      archived: archivedProducts.length,
    }
    const getProduct = (id, options = {}) =>
      products.find((product) => product.id === id && (options.includeUnpublished || product.status === 'published'))

    return {
      products,
      publishedProducts,
      draftProducts,
      archivedProducts,
      categories,
      publishedCategories,
      productCounts,
      productStatuses: PRODUCT_STATUSES,
      loading,
      error,
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      removeProduct: deleteProduct,
      setProductStatus,
      publishProduct,
      unpublishProduct,
      archiveProduct,
    }
  }, [addProduct, archiveProduct, deleteProduct, error, loading, products, publishProduct, refreshProducts, setProductStatus, unpublishProduct, updateProduct])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used within ProductsProvider')
  return context
}
