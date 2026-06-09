import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './styles/global.css'

const FutureRoute = ({ title }) => (
  <section className="min-h-screen pt-32 pb-20">
    <div className="container-custom">
      <p className="section-kicker">Future page</p>
      <h1 className="mt-4 text-4xl font-bold text-gradient">{title}</h1>
      <p className="mt-4 max-w-2xl text-text-muted">
        This route is reserved in the architecture so Icon Editz can grow into a full digital products platform.
      </p>
    </div>
  </section>
)

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<FutureRoute title="Portfolio" />} />
            <Route path="/services" element={<FutureRoute title="Services" />} />
            <Route path="/store" element={<FutureRoute title="Store" />} />
            <Route path="/store/:productSlug" element={<FutureRoute title="Product Details" />} />
            <Route path="/blog" element={<FutureRoute title="Blog" />} />
            <Route path="/contact" element={<FutureRoute title="Contact" />} />
            <Route path="/dashboard" element={<FutureRoute title="Dashboard" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
