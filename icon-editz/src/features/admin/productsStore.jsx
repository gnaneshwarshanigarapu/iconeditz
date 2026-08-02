import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { request } from '../../utils/api'

const ProductsContext = createContext(null)

// The new provider is much simpler. It no longer holds any state itself.
// It just provides the API functions to the rest of the app.
// Components will be responsible for their own data fetching and state management.
export function ProductsProvider({ children }) {

  const normalize = (product) => ({ ...product, thumbnail: product.thumbnail || product.thumbnail_path, image: product.image || product.thumbnail_path, demoVideo: product.demoVideo || product.demo_video, discountPrice: product.discountPrice ?? product.discount_price })
  const getProducts = useCallback(async () => {
    const response = await request('/api/products')
    return { data: (response.data || []).map(normalize), products: (response.data || []).map(normalize), count: response.data?.length || 0, error: null }
  }, [])
  const getPublishedProducts = useCallback(async () => (await getProducts()).data, [getProducts])
  const getProduct = useCallback(async (id) => {
    if (!id) return null
    const response = await request(`/api/products?id=${encodeURIComponent(id)}`)
    return response.product ? normalize(response.product) : null
  }, [])
  const toRecord = (product) => ({ ...product, thumbnail_path: product.thumbnail || product.image || null, demo_video: product.demoVideo || null, discount_price: product.discountPrice == null || product.discountPrice === '' ? null : Number(product.discountPrice), published: product.status ? product.status === 'published' : Boolean(product.published), status: product.status || (product.published ? 'published' : 'draft') })
  const upsertProduct = useCallback(async (product) => {
    const endpoint = product.id ? `/api/products?id=${encodeURIComponent(product.id)}` : '/api/products'
    const response = await request(endpoint, { method: product.id ? 'PUT' : 'POST', body: toRecord(product) })
    return { data: normalize(response.data), error: null }
  }, [])
  const deleteProduct = useCallback(async (id) => { await request(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' }); return { data: null, error: null } }, [])
  const toggleProductPublish = useCallback(async (id, published) => upsertProduct({ id, published, status: published ? 'published' : 'draft' }), [upsertProduct])
  const getDashboardSummary = useCallback(async () => {
    const response = await request('/api/admin')
    const data = response.data || {}
    return { data: { totalProducts: data.products || 0, totalCustomers: 0, totalSales: 0, todaySales: 0, orders: data.orders || 0, downloads: 0 }, error: null }
  }, [])
  const getRecentProducts = useCallback(async () => { const { data } = await getProducts(); return { data: data.slice(0, 6), error: null } }, [getProducts])

  const setProductStatus = useCallback(async (id, published) => {
    return await toggleProductPublish(id, published)
  }, [toggleProductPublish])

  const publishProduct = useCallback((id) => setProductStatus(id, true), [setProductStatus])
  const unpublishProduct = useCallback((id) => setProductStatus(id, false), [setProductStatus])

  const value = useMemo(() => {
    return {
      // Data fetching
      getProducts,
      getPublishedProducts,
      getProduct,
      getDashboardSummary,
      getRecentProducts,
      
      // Data mutation
      upsertProduct,
      addProduct: upsertProduct,
      updateProduct: async (id, patch) => upsertProduct({ ...patch, id }),
      archiveProduct: async (id) => toggleProductPublish(id, false),
      deleteProduct,
      toggleProductPublish,
      publishProduct,
      unpublishProduct,
    }
  }, [getProducts, getPublishedProducts, getProduct, upsertProduct, deleteProduct, toggleProductPublish, getDashboardSummary, getRecentProducts, publishProduct, unpublishProduct])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used within Products-Provider')
  return context
}
