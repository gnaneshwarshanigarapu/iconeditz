import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid,
  FiGlobe,
  FiBriefcase,
  FiBox,
  FiTag,
  FiShoppingBag,
  FiCreditCard,
  FiUsers,
  FiBarChart2,
  FiMessageSquare,
  FiFolder,
  FiSettings,
  FiChevronDown,
  FiLogOut,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Logo from '../common/Logo'

const websiteSubmenu = [
  { label: 'Overview', to: '/admin/content' },
  { label: 'Home Page', to: '/admin/content/homepage' },
  { label: 'About Page', to: '/admin/content/about' },
  { label: 'Services Page', to: '/admin/content/services' },
  { label: 'Projects Page', to: '/admin/content/projects' },
  { label: 'Store Page', to: '/admin/content/store' },
  { label: 'Hire Page', to: '/admin/content/hire-from-us' },
  { label: 'Footer CMS', to: '/admin/content/footer' },
  { label: 'SEO Defaults', to: '/admin/content/seo' },
]

export default function Sidebar({ mobileOpen = false, onMobileClose, collapsed = false, onToggleCollapse }) {
  const { logout, user } = useAuth()
  const location = useLocation()
  const isWebsiteActive = location.pathname.startsWith('/admin/content')
  const [websiteOpen, setWebsiteOpen] = useState(isWebsiteActive)

  useEffect(() => {
    if (isWebsiteActive) {
      setWebsiteOpen(true)
    }
  }, [isWebsiteActive])

  // Close mobile drawer on route change
  useEffect(() => {
    if (onMobileClose) onMobileClose()
  }, [location.pathname])

  const userRole = user?.app_metadata?.role || user?.user_metadata?.role || 'Super Admin'

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-primary/25 to-primary/10 text-white border border-primary/30 shadow-lg shadow-primary/10'
        : 'text-text-muted hover:bg-white/[0.06] hover:text-white'
    }`

  const subNavClass = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary/20 text-white font-semibold border-l-2 border-primary pl-2.5'
        : 'text-text-muted hover:bg-white/[0.05] hover:text-white'
    }`

  const content = (
    <div className="flex h-full flex-col px-3 py-5 text-text">
      {/* Brand Header */}
      <div className="mb-6 flex items-center justify-between px-2 shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <Logo />
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
              CMS v2
            </span>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary font-bold text-lg border border-primary/30">
            IE
          </div>
        )}
        {mobileOpen && (
          <button
            type="button"
            onClick={onMobileClose}
            className="text-text-muted hover:text-white lg:hidden"
          >
            <FiX className="text-xl" />
          </button>
        )}
      </div>

      {/* 12 Sidebar Menu Items */}
      <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {/* 1. Dashboard */}
        <NavLink to="/admin/dashboard" className={navClass} title="Dashboard">
          <FiGrid className="text-lg text-primary shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {/* 2. Website CMS Accordion */}
        <div>
          <button
            type="button"
            onClick={() => setWebsiteOpen(!websiteOpen)}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isWebsiteActive
                ? 'bg-white/[0.06] text-white'
                : 'text-text-muted hover:bg-white/[0.06] hover:text-white'
            }`}
            title="Website CMS"
          >
            <div className="flex items-center gap-3">
              <FiGlobe className="text-lg text-purple-400 shrink-0" />
              {!collapsed && <span>Website</span>}
            </div>
            {!collapsed && (
              <FiChevronDown
                className={`text-xs transition-transform duration-200 ${websiteOpen ? 'rotate-180 text-white' : 'text-text-muted'}`}
              />
            )}
          </button>

          {!collapsed && websiteOpen && (
            <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-white/10 pl-3">
              {websiteSubmenu.map((sub) => (
                <NavLink key={sub.to} to={sub.to} className={subNavClass}>
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 3. Services */}
        <NavLink to="/admin/services" className={navClass} title="Services">
          <FiBriefcase className="text-lg text-amber-400 shrink-0" />
          {!collapsed && <span>Services</span>}
        </NavLink>

        {/* 4. Products / Assets */}
        <NavLink to="/admin/products" className={navClass} title="Products / Assets">
          <FiBox className="text-lg text-blue-400 shrink-0" />
          {!collapsed && <span>Products / Assets</span>}
        </NavLink>

        {/* 5. Coupons & Offers */}
        <NavLink to="/admin/coupons" className={navClass} title="Coupons & Offers">
          <FiTag className="text-lg text-emerald-400 shrink-0" />
          {!collapsed && <span>Coupons & Offers</span>}
        </NavLink>

        {/* 6. Orders */}
        <NavLink to="/admin/orders" className={navClass} title="Orders">
          <FiShoppingBag className="text-lg text-orange-400 shrink-0" />
          {!collapsed && <span>Orders</span>}
        </NavLink>

        {/* 7. Payment Attempts */}
        <NavLink to="/admin/payment-attempts" className={navClass} title="Payment Attempts">
          <FiCreditCard className="text-lg text-rose-400 shrink-0" />
          {!collapsed && <span>Payment Attempts</span>}
        </NavLink>

        {/* 8. Customers */}
        <NavLink to="/admin/customers" className={navClass} title="Customers">
          <FiUsers className="text-lg text-indigo-400 shrink-0" />
          {!collapsed && <span>Customers</span>}
        </NavLink>

        {/* 9. Reports */}
        <NavLink to="/admin/reports" className={navClass} title="Reports">
          <FiBarChart2 className="text-lg text-teal-400 shrink-0" />
          {!collapsed && <span>Reports</span>}
        </NavLink>

        {/* 10. Enquiries */}
        <NavLink to="/admin/enquiries" className={navClass} title="Enquiries">
          <FiMessageSquare className="text-lg text-pink-400 shrink-0" />
          {!collapsed && <span>Enquiries</span>}
        </NavLink>

        {/* 11. Media Library */}
        <NavLink to="/admin/media" className={navClass} title="Media Library">
          <FiFolder className="text-lg text-cyan-400 shrink-0" />
          {!collapsed && <span>Media Library</span>}
        </NavLink>

        {/* 12. Settings */}
        <NavLink to="/admin/settings" className={navClass} title="Settings">
          <FiSettings className="text-lg text-gray-400 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* Collapse Desktop Toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center gap-2 my-2 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-text-muted hover:text-white transition-all"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <FiChevronRight /> : <><FiChevronLeft /> <span>Collapse Menu</span></>}
      </button>

      {/* User Footer & Logout */}
      <div className="mt-2 pt-3 border-t border-white/10 shrink-0 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary border border-primary/30 shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-xs font-semibold text-white">{user?.email || 'admin@iconeditz.com'}</span>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">{userRole}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-all duration-200"
          title="Sign Out"
        >
          <FiLogOut />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden h-screen border-r border-white/10 bg-[#0c081e]/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 lg:block ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        >
          <div
            className="h-full w-72 bg-[#0c081e] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  )
}
