import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import StoreRoutes from './routes/StoreRoutes'
import AdminRoutes from './routes/AdminRoutes'
import PaymentRoutes from './routes/PaymentRoutes'
import PaymentProvider from './features/payments/PaymentProvider'
import { ProductsProvider } from './features/admin/productsStore.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import FutureRoute from './components/FutureRoute'
import './styles/global.css'

function AppChrome() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-background text-text">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<FutureRoute title="Portfolio" />} />
          <Route path="/services" element={<FutureRoute title="Services" />} />
          <Route path="/store/*" element={<StoreRoutes />} />
          <Route path="/blog" element={<FutureRoute title="Blog" />} />
          <Route path="/contact" element={<FutureRoute title="Contact" />} />
          <Route path="/payments/*" element={<PaymentRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
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
            <AppChrome />
          </PaymentProvider>
        </AuthProvider>
      </ProductsProvider>
    </Router>
  )
}
