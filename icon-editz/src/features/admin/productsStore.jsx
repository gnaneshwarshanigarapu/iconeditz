import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { 
  getProducts, 
  upsertProduct, 
  deleteProduct, 
  toggleProductPublish,
  getDashboardSummary,
  getRecentProducts 
} from '../../utils/supabase'

const ProductsContext = createContext(null)

// The new provider is much simpler. It no longer holds any state itself.
// It just provides the API functions to the rest of the app.
// Components will be responsible for their own data fetching and state management.
export function ProductsProvider({ children }) {

  const setProductStatus = useCallback(async (id, published) => {
    return await toggleProductPublish(id, published)
  }, [])

  const publishProduct = useCallback((id) => setProductStatus(id, true), [setProductStatus])
  const unpublishProduct = useCallback((id) => setProductStatus(id, false), [setProductStatus])

  const value = useMemo(() => {
    return {
      // Data fetching
      getProducts,
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
  }, [publishProduct, unpublishProduct])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used within Products-Provider')
  return context
}
