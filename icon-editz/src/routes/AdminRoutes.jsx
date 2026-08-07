import React, { lazy, Suspense } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import Loading from '../components/Loading'
import AdminProtectedRoute from '../components/AdminProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'

const AdminLogin = lazy(() => import('../pages/AdminLogin'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const WebsitePagesPage = lazy(() => import('../pages/admin/WebsitePagesPage'))
const ServicesAdminPage = lazy(() => import('../pages/admin/ServicesAdminPage'))
const MediaLibraryPage = lazy(() => import('../pages/admin/MediaLibraryPage'))
const OrdersPage = lazy(() => import('../pages/admin/OrdersPage'))
const PaymentAttemptsPage = lazy(() => import('../pages/admin/PaymentAttemptsPage'))
const CustomersPage = lazy(() => import('../pages/admin/CustomersPage'))
const CouponsPage = lazy(() => import('../pages/admin/CouponsPage'))
const ReportsPage = lazy(() => import('../pages/admin/ReportsPage'))
const EnquiriesPage = lazy(() => import('../pages/admin/EnquiriesPage'))
const ProductList = lazy(() => import('../pages/admin/products/ProductList'))
const AddProduct = lazy(() => import('../pages/admin/products/AddProduct'))
const EditProduct = lazy(() => import('../pages/admin/products/EditProduct'))
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'))
const PageContentCms = lazy(() => import('../pages/admin/PageContentCms'))
const SingletonContentCms = lazy(() => import('../pages/admin/SingletonContentCms'))
const Settings = lazy(() => import('../pages/admin/Settings'))
const DatabaseHealthPage = lazy(() => import('../pages/admin/DatabaseHealthPage'))
const HireRequestsPage = lazy(() => import('../pages/admin/HireRequestsPage'))

function AdminPage({ title, children }) {
  return (
    <AdminProtectedRoute>
      <AdminLayout title={title}>{children}</AdminLayout>
    </AdminProtectedRoute>
  )
}

export default function AdminRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 12 Core Sidebar Modules */}
        <Route path="/dashboard" element={<AdminPage title="Enterprise Dashboard"><AdminDashboard /></AdminPage>} />
        <Route path="/content" element={<AdminPage title="Website Pages Overview"><WebsitePagesPage /></AdminPage>} />
        <Route path="/services" element={<AdminPage title="Services Management"><ServicesAdminPage /></AdminPage>} />
        <Route path="/products" element={<AdminPage title="Products / Assets"><ProductList /></AdminPage>} />
        <Route path="/coupons" element={<AdminPage title="Coupons & Offers"><CouponsPage /></AdminPage>} />
        <Route path="/orders" element={<AdminPage title="Customer Orders"><OrdersPage /></AdminPage>} />
        <Route path="/payment-attempts" element={<AdminPage title="Payment Attempts"><PaymentAttemptsPage /></AdminPage>} />
        <Route path="/customers" element={<AdminPage title="Customer Profiles"><CustomersPage /></AdminPage>} />
        <Route path="/reports" element={<AdminPage title="Reports & Analytics"><ReportsPage /></AdminPage>} />
        <Route path="/enquiries" element={<AdminPage title="Customer Enquiries"><EnquiriesPage /></AdminPage>} />
        <Route path="/media" element={<AdminPage title="Media Asset Library"><MediaLibraryPage /></AdminPage>} />
        <Route path="/settings" element={<AdminPage title="System Settings"><Settings /></AdminPage>} />

        {/* Website CMS Sub-editors */}
        <Route path="/content/homepage" element={<AdminPage title="Home Page CMS"><PageContentCms page="Homepage" sections={['Hero', 'Showreel', 'Services', 'Projects', 'Tools', 'Testimonials', 'FAQ', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/about" element={<AdminPage title="About Page CMS"><PageContentCms page="About Page" sections={['Hero', 'Story', 'Skills', 'Stats', 'Timeline', 'Tools', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/services" element={<AdminPage title="Services Page CMS"><PageContentCms page="Services Page" sections={['Hero', 'Services', 'Pricing', 'FAQ', 'Testimonials', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/projects" element={<AdminPage title="Projects Page CMS"><PageContentCms page="Projects Page" sections={['Hero', 'Portfolio', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/store" element={<AdminPage title="Store Page CMS"><PageContentCms page="Store Page" sections={['Hero', 'FAQ', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/hire-from-us" element={<AdminPage title="Hire Page CMS"><PageContentCms page="Hire From Us Page" sections={['Hero', 'Services', 'Process', 'FAQ', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/footer" element={<AdminPage title="Footer CMS"><SingletonContentCms table="footer_content" title="Footer CMS" /></AdminPage>} />
        <Route path="/content/seo" element={<AdminPage title="SEO Defaults"><SingletonContentCms table="settings" title="SEO Defaults" /></AdminPage>} />

        {/* Product Sub-routes */}
        <Route path="/products/add" element={<AdminPage title="Add Product Asset"><AddProduct /></AdminPage>} />
        <Route path="/products/:id/edit" element={<AdminPage title="Edit Product Asset"><EditProduct /></AdminPage>} />
        <Route path="/categories" element={<AdminPage title="Categories"><CategoriesPage /></AdminPage>} />

        {/* Additional Admin Tools */}
        <Route path="/hire-requests" element={<AdminPage title="Hire Inquiries"><HireRequestsPage /></AdminPage>} />
        <Route path="/health" element={<AdminPage title="Database Health"><DatabaseHealthPage /></AdminPage>} />
      </Routes>
    </Suspense>
  )
}
