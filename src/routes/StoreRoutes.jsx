import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Loading from '../components/Loading'
import FutureRoute from '../components/FutureRoute'
import { isEnabled } from '../constants/features'

const Store = lazy(() => import('../pages/store/Store'))
const ProductDetail = lazy(() => import('../pages/store/ProductDetail'))

export default function StoreRoutes() {
  if (!isEnabled('store')) return <FutureRoute title="Store" />

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/:productId" element={<ProductDetail />} />
      </Routes>
    </Suspense>
  )
}
