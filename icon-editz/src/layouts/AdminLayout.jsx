import React from 'react'
import Sidebar from '../components/admin/Sidebar'
import Header from '../components/admin/Header'

export default function AdminLayout({ children, title = 'Dashboard', eyebrow = 'Enterprise CMS' }) {
  return (
    <div className="min-h-screen bg-[#090514] text-text font-sans selection:bg-primary selection:text-white">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_rgba(157,92,255,0.15),transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(120,50,255,0.1),transparent_50%)]" />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="relative z-10 lg:pl-64 flex flex-col min-h-screen">
        <Header title={title} eyebrow={eyebrow} />
        <main className="flex-1 px-4 py-6 sm:px-6 xl:px-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
