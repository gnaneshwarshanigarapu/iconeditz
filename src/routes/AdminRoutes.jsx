import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Loading from '../components/Loading'
import FutureRoute from '../components/FutureRoute'
import AdminProtectedRoute from '../components/AdminProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import { isEnabled } from '../constants/features'

const AdminLogin = lazy(() => import('../pages/AdminLogin'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const ProductList = lazy(() => import('../pages/admin/products/ProductList'))
const AddProduct = lazy(() => import('../pages/admin/products/AddProduct'))
const EditProduct = lazy(() => import('../pages/admin/products/EditProduct'))

function AdminPage({ title, children }) {
  return (
    <AdminProtectedRoute>
      <AdminLayout title={title}>{children}</AdminLayout>
    </AdminProtectedRoute>
  )
}

function MockAdminSection({ title }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-8 shadow-xl backdrop-blur-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Coming Soon</p>
      <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-text-muted">
        Mock dashboard data is active first. This section is ready for the next backend phase.
      </p>
    </div>
  )
}

export default function AdminRoutes() {
  if (!isEnabled('admin')) return <FutureRoute title="Admin" />

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<AdminPage title="Dashboard"><AdminDashboard /></AdminPage>} />
        <Route path="/products" element={<AdminPage title="Products"><ProductList /></AdminPage>} />
        <Route path="/products/add" element={<AdminPage title="Add Product"><AddProduct /></AdminPage>} />
        <Route path="/products/:id/edit" element={<AdminPage title="Edit Product"><EditProduct /></AdminPage>} />
        <Route path="/orders" element={<AdminPage title="Orders"><MockAdminSection title="Orders" /></AdminPage>} />
        <Route path="/customers" element={<AdminPage title="Customers"><MockAdminSection title="Customers" /></AdminPage>} />
        <Route path="/downloads" element={<AdminPage title="Downloads"><MockAdminSection title="Downloads" /></AdminPage>} />
        <Route path="/settings" element={<AdminPage title="Settings"><MockAdminSection title="Settings" /></AdminPage>} />
      </Routes>
    </Suspense>
  )
}
