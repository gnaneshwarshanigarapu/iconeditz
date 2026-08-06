import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid,
  FiGlobe,
  FiBox,
  FiTag,
  FiShoppingBag,
  FiCreditCard,
  FiUsers,
  FiBarChart2,
  FiFolder,
  FiSettings,
  FiChevronDown,
  FiLogOut,
  FiExternalLink,
  FiShield,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Logo from '../common/Logo'

const websiteSubmenu = [
  { label: 'Home', to: '/admin/content/homepage' },
  { label: 'About', to: '/admin/content/about' },
  { label: 'Services', to: '/admin/content/services' },
  { label: 'Projects', to: '/admin/content/projects' },
  { label: 'Store', to: '/admin/content/store' },
  { label: 'Hire', to: '/admin/content/hire-from-us' },
  { label: 'Footer', to: '/admin/content/footer' },
  { label: 'SEO', to: '/admin/content/seo' },
]

export default function Sidebar() {
  const { logout, user } = useAuth()
  const location = useLocation()
  const isWebsiteActive = location.pathname.startsWith('/admin/content')
  const [websiteOpen, setWebsiteOpen] = useState(isWebsiteActive)

  // Expand website dropdown when navigating to any website content page
  useEffect(() => {
    if (isWebsiteActive) {
      setWebsiteOpen(true)
    }
  }, [isWebsiteActive])

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

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-white/10 bg-[#0c081e]/95 px-4 py-5 text-text shadow-2xl backdrop-blur-2xl lg:flex">
      {/* Brand Header */}
      <div className="mb-6 flex items-center justify-between px-2 shrink-0">
        <Logo />
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
          CMS v2
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className={navClass}>
          <FiGrid className="text-lg text-primary" />
          <span>Dashboard</span>
        </NavLink>

        {/* Website CMS Accordion */}
        <div>
          <button
            type="button"
            onClick={() => setWebsiteOpen(!websiteOpen)}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isWebsiteActive
                ? 'bg-white/[0.06] text-white'
                : 'text-text-muted hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FiGlobe className="text-lg text-accent-purple" />
              <span>Website</span>
            </div>
            <FiChevronDown
              className={`text-xs transition-transform duration-200 ${websiteOpen ? 'rotate-180 text-white' : 'text-text-muted'}`}
            />
          </button>

          {websiteOpen && (
            <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-white/10 pl-3">
              {websiteSubmenu.map((sub) => (
                <NavLink key={sub.to} to={sub.to} className={subNavClass}>
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Products / Assets */}
        <NavLink to="/admin/products" className={navClass}>
          <FiBox className="text-lg text-blue-400" />
          <span>Products / Assets</span>
        </NavLink>

        {/* Coupons & Offers */}
        <NavLink to="/admin/coupons" className={navClass}>
          <FiTag className="text-lg text-emerald-400" />
          <span>Coupons & Offers</span>
        </NavLink>

        {/* Orders */}
        <NavLink to="/admin/orders" className={navClass}>
          <FiShoppingBag className="text-lg text-amber-400" />
          <span>Orders</span>
        </NavLink>

        {/* Payment Attempts */}
        <NavLink to="/admin/payment-attempts" className={navClass}>
          <FiCreditCard className="text-lg text-rose-400" />
          <span>Payment Attempts</span>
        </NavLink>

        {/* Customers */}
        <NavLink to="/admin/customers" className={navClass}>
          <FiUsers className="text-lg text-indigo-400" />
          <span>Customers</span>
        </NavLink>

        {/* Reports */}
        <NavLink to="/admin/reports" className={navClass}>
          <FiBarChart2 className="text-lg text-teal-400" />
          <span>Reports</span>
        </NavLink>

        {/* Media Library */}
        <NavLink to="/admin/media" className={navClass}>
          <FiFolder className="text-lg text-cyan-400" />
          <span>Media Library</span>
        </NavLink>

        {/* Settings */}
        <NavLink to="/admin/settings" className={navClass}>
          <FiSettings className="text-lg text-gray-400" />
          <span>Settings</span>
        </NavLink>

        {/* Health */}
        <NavLink to="/admin/health" className={navClass}>
          <FiShield className="text-lg text-emerald-400" />
          <span>Database Health</span>
        </NavLink>
      </nav>

      {/* User Footer & Logout */}
      <div className="mt-4 pt-4 border-t border-white/10 shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary border border-primary/30">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-xs font-semibold text-white">{user?.email || 'Admin User'}</span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Super Administrator</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-all duration-200"
        >
          <FiLogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
