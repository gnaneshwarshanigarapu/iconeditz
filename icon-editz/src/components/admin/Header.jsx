import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FiBell,
  FiExternalLink,
  FiSearch,
  FiMenu,
  FiUser,
  FiLogOut,
  FiShield,
  FiCheck,
  FiClock,
  FiX,
  FiSettings,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

const pathMap = {
  dashboard: 'Dashboard',
  products: 'Products & Assets',
  services: 'Services',
  add: 'Create Product',
  edit: 'Edit Product',
  categories: 'Categories',
  content: 'Website CMS',
  homepage: 'Home Page',
  about: 'About Page',
  projects: 'Projects Page',
  store: 'Store Page',
  'hire-from-us': 'Hire Page',
  footer: 'Footer CMS',
  seo: 'SEO Defaults',
  coupons: 'Coupons & Offers',
  orders: 'Orders',
  'payment-attempts': 'Payment Attempts',
  customers: 'Customers',
  reports: 'Reports & Analytics',
  enquiries: 'Enquiries',
  media: 'Media Library',
  settings: 'Settings',
  health: 'Database Health',
}

const mockNotifications = [
  { id: 1, title: 'New Order Received', desc: 'Order #ORD-9842 verified for ₹1,499', time: '5m ago', unread: true },
  { id: 2, title: 'Payment Attempt Failed', desc: 'Razorpay payment timed out for user@email.com', time: '20m ago', unread: true },
  { id: 3, title: 'New Customer Registered', desc: 'shanigarapugnaneshwar143@gmail.com joined', time: '1h ago', unread: false },
]

export default function Header({ title = 'Dashboard', eyebrow = 'Enterprise CMS', onMobileMenuClick }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((part) => pathMap[part] || part.replace(/-/g, ' '))

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(mockNotifications)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const userRole = user?.app_metadata?.role || user?.user_metadata?.role || 'Super Admin'

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0717]/90 backdrop-blur-2xl px-4 py-3.5 sm:px-6 xl:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mobile Toggle + Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white lg:hidden hover:bg-white/10"
          >
            <FiMenu className="text-xl" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="font-semibold uppercase tracking-wider text-primary">{eyebrow}</span>
              <span>/</span>
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 capitalize">
                {crumbs.map((crumb, idx) => (
                  <React.Fragment key={`${crumb}-${idx}`}>
                    <span className={idx === crumbs.length - 1 ? 'font-semibold text-white' : 'text-text-muted'}>
                      {crumb}
                    </span>
                    {idx < crumbs.length - 1 && <span className="text-white/30">›</span>}
                  </React.Fragment>
                ))}
              </nav>
            </div>
            <h1 className="mt-0.5 text-xl font-bold text-white sm:text-2xl">{title}</h1>
          </div>
        </div>

        {/* Right: Search + Notifications + Profile + Public Link */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Bar */}
          <div className="relative hidden w-56 md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search everywhere..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-text-muted transition-colors hover:text-white hover:bg-white/[0.1]"
              title="Notifications"
            >
              <FiBell className="text-base" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0e0a22] p-4 shadow-2xl backdrop-blur-2xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-all ${
                        n.unread ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                          <FiClock /> {n.time}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-1.5 pr-3 text-xs font-semibold text-white hover:bg-white/[0.1] transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white shadow-md">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:inline truncate max-w-[100px]">{user?.email?.split('@')[0] || 'Admin'}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#0e0a22] p-3 shadow-2xl backdrop-blur-2xl z-50">
                <div className="p-2 border-b border-white/10 mb-2">
                  <p className="text-xs font-bold text-white truncate">{user?.email || 'admin@iconeditz.com'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <FiShield className="text-primary text-xs" />
                    <span className="text-[10px] font-semibold text-primary uppercase">{userRole}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <FiSettings />
                    <span>System Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false)
                      logout()
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold"
                  >
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* View Store */}
          <Link
            to="/store"
            target="_blank"
            className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:scale-[1.02]"
          >
            <FiExternalLink />
            <span className="hidden lg:inline">View Public Store</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
