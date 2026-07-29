import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ProjectsPage from './pages/ProjectsPage'
import ProductsPage from './pages/ProductsPage'
import ContactPage from './pages/ContactPage'
import HireFromUsPage from './pages/HireFromUsPage'
import NotFoundPage from './pages/NotFoundPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import StoreRoutes from './routes/StoreRoutes'
import AdminRoutes from './routes/AdminRoutes'
import PaymentRoutes from './routes/PaymentRoutes'
import PaymentProvider from './features/payments/PaymentProvider'
import { ProductsProvider } from './features/admin/productsStore.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import PageTransition from './components/ui/PageTransition'
import ErrorBoundary from './components/ui/ErrorBoundary'
import SkipLink from './components/ui/SkipLink'
import { trackPageView } from './utils/tracking'
import './styles/global.css'

import Analytics from './components/Analytics'

function AppChrome() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])

  return (
    <div className="min-h-screen bg-background text-text">
      {!isAdminRoute && <SkipLink />}
      {!isAdminRoute && <Navbar />}
      <main id="main-content" className="min-h-screen w-full">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/hire-us" element={<HireFromUsPage />} />
            <Route path="/store/*" element={<StoreRoutes />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/payments/*" element={<PaymentRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageTransition>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}
export default function App() {
  return (
    <Router>
      <ProductsProvider>
        <AuthProvider>
          <PaymentProvider>
            <ErrorBoundary>
              <Analytics />
              <AppChrome />
            </ErrorBoundary>
          </PaymentProvider>
        </AuthProvider>
      </ProductsProvider>
    </Router>
  )
}
