import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function StoreLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
