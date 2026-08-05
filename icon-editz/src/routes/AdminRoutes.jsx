import React, { lazy, Suspense } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
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
const HireFromUsAdminPage = lazy(() => import('../pages/admin/HireFromUsAdminPage'))
const HireRequestsPage = lazy(() => import('../pages/admin/HireRequestsPage'))
const Settings = lazy(() => import('../pages/admin/Settings'));
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'))
const PageContentCms = lazy(() => import('../pages/admin/PageContentCms'))
const SingletonContentCms = lazy(() => import('../pages/admin/SingletonContentCms'))
const NewsletterSubscribersPage = lazy(() => import('../pages/admin/NewsletterSubscribersPage'))
const LegalPagesAdmin = lazy(() => import('../pages/admin/LegalPagesAdmin'))
const DatabaseHealthPage = lazy(() => import('../pages/admin/DatabaseHealthPage'))
const CollectionCms = lazy(() => import('../components/admin/CollectionCms'))

function AdminPage({ title, children }) {
  return (
    <AdminProtectedRoute>
      <AdminLayout title={title}>{children}</AdminLayout>
    </AdminProtectedRoute>
  )
}

export default function AdminRoutes() {
  if (!isEnabled('admin')) return <FutureRoute title="Admin" />

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminPage title="Dashboard"><AdminDashboard /></AdminPage>} />
        <Route path="/health" element={<AdminPage title="Database Health"><DatabaseHealthPage /></AdminPage>} />
        <Route path="/products" element={<AdminPage title="Products"><ProductList /></AdminPage>} />
        <Route path="/products/add" element={<AdminPage title="Add Product"><AddProduct /></AdminPage>} />
        <Route path="/products/:id/edit" element={<AdminPage title="Edit Product"><EditProduct /></AdminPage>} />
        <Route path="/categories" element={<AdminPage title="Categories"><CategoriesPage /></AdminPage>} />
        <Route path="/content" element={<Navigate to="/admin/content/homepage" replace />} />
        <Route path="/content/homepage" element={<AdminPage title="Homepage CMS"><PageContentCms page="Homepage" sections={['Hero', 'Featured Services', 'Featured Projects', 'Featured Products', 'Testimonials', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/about" element={<AdminPage title="About Page CMS"><PageContentCms page="About Page" sections={['Hero', 'Story', 'Skills', 'Timeline', 'Team', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/services" element={<AdminPage title="Services Page CMS"><PageContentCms page="Services Page" sections={['Hero', 'Services', 'Pricing', 'FAQ', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/projects" element={<AdminPage title="Projects Page CMS"><PageContentCms page="Projects Page" sections={['Hero', 'Categories', 'Portfolio', 'Filters', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/store" element={<AdminPage title="Store Page CMS"><PageContentCms page="Store Page" sections={['Hero', 'Categories', 'Featured Products', 'Banner', 'SEO']} /></AdminPage>} />
        <Route path="/content/hire-from-us" element={<AdminPage title="Hire From Us CMS"><PageContentCms page="Hire From Us Page" sections={['Hero', 'Features', 'Enquiry Form', 'CTA', 'SEO']} /></AdminPage>} />
        <Route path="/content/footer" element={<AdminPage title="Footer CMS"><SingletonContentCms table="footer_content" title="Footer CMS" /></AdminPage>} />
        <Route path="/content/cta" element={<AdminPage title="CTA CMS"><SingletonContentCms table="cta_content" title="CTA CMS" /></AdminPage>} />
        <Route path="/content/legal" element={<AdminPage title="Legal Pages"><LegalPagesAdmin /></AdminPage>} />

        <Route path="/collections/projects" element={<AdminPage title="Projects Collection"><CollectionCms collectionName="projects" /></AdminPage>} />
        <Route path="/collections/tools" element={<AdminPage title="Tools Collection"><CollectionCms collectionName="tools" /></AdminPage>} />
        <Route path="/collections/skills" element={<AdminPage title="Skills Collection"><CollectionCms collectionName="skills" /></AdminPage>} />

        <Route path="/newsletter-subscribers" element={<AdminPage title="Newsletter Subscribers"><NewsletterSubscribersPage /></AdminPage>} />
        <Route path="/hire-us" element={<Navigate to="/admin/content/hire-from-us" replace />} />
        <Route path="/hire-requests" element={<AdminPage title="Hire Requests"><HireRequestsPage /></AdminPage>} />
        <Route path="/settings" element={<AdminPage title="Settings"><Settings /></AdminPage>} />
      </Routes>
    </Suspense>
  )
}
