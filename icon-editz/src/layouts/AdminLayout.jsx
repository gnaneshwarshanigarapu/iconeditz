import React, { useState } from 'react'
import Sidebar from '../components/admin/Sidebar'
import Header from '../components/admin/Header'
import { ToastProvider } from '../components/ui/ToastProvider'

export default function AdminLayout({ children, title = 'Dashboard', eyebrow = 'Enterprise CMS' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#090514] text-text font-sans selection:bg-primary selection:text-white">
        {/* Dynamic Background Mesh */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_rgba(157,92,255,0.15),transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(120,50,255,0.1),transparent_50%)]" />

        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        {/* Main Container */}
        <div
          className={`relative z-10 flex flex-col min-h-screen transition-all duration-300 ${
            collapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          <Header
            title={title}
            eyebrow={eyebrow}
            onMobileMenuClick={() => setMobileOpen(true)}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 xl:px-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
