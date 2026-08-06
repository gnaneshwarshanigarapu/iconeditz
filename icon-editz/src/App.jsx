import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ProjectsPage from './pages/ProjectsPage'
import ProductsPage from './pages/ProductsPage'
import HireFromUsPage from './pages/HireFromUsPage'
import LegalPage from './pages/LegalPage'
import NotFoundPage from './pages/NotFoundPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import StoreRoutes from './routes/StoreRoutes'
import AdminRoutes from './routes/AdminRoutes'
import PaymentRoutes from './routes/PaymentRoutes'
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
    <>
      {!isAdminRoute && <SkipLink />}
      {!isAdminRoute && <Navbar />}
      <div className="min-h-screen bg-background text-text">
        <main id="main-content" className="min-h-screen w-full">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/hire" element={<HireFromUsPage />} />
              <Route path="/hire-from-us" element={<HireFromUsPage />} />
              <Route path="/contact" element={<HireFromUsPage />} />
              <Route path="/legal/:slug" element={<LegalPage />} />
              <Route path="/store/*" element={<StoreRoutes />} />
              <Route path="/payments/*" element={<PaymentRoutes />} />
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PageTransition>
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  )
}

export default function App() {
  return (
    <Router>
      <ProductsProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Analytics />
            <AppChrome />
          </ErrorBoundary>
        </AuthProvider>
      </ProductsProvider>
    </Router>
  )
}
