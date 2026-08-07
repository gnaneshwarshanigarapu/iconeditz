import React, { createContext, useContext, useEffect, useState } from 'react'

const LoadingContext = createContext({
  isAssetPreloaded: false,
  preloadAsset: () => {},
})

export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }) {
  const [preloadedAssets, setPreloadedAssets] = useState(new Set())
  const [isAssetPreloaded, setIsAssetPreloaded] = useState(false)

  const preloadAsset = (src) => {
    if (!src || preloadedAssets.has(src)) return
    const img = new Image()
    img.src = src
    img.onload = () => {
      setPreloadedAssets((prev) => new Set(prev).add(src))
    }
  }

  useEffect(() => {
    // Critical App-wide Preloads
    const criticalAssets = [
      '/assets/logos/icon-editz.jpg',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
    ]
    criticalAssets.forEach(preloadAsset)
    setIsAssetPreloaded(true)
  }, [])

  return (
    <LoadingContext.Provider value={{ isAssetPreloaded, preloadAsset }}>
      {children}
    </LoadingContext.Provider>
  )
}
