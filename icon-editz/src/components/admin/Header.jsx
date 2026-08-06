import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiBell, FiExternalLink, FiSearch, FiLayers } from 'react-icons/fi'

const pathMap = {
  dashboard: 'Dashboard',
  products: 'Products & Assets',
  add: 'Create Product',
  edit: 'Edit Product',
  categories: 'Categories',
  content: 'Website CMS',
  homepage: 'Home Page',
  about: 'About Page',
  services: 'Services Page',
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
  media: 'Media Library',
  settings: 'Settings',
  health: 'Database Health',
}

export default function Header({ title = 'Dashboard', eyebrow = 'Enterprise CMS' }) {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((part) => pathMap[part] || part.replace(/-/g, ' '))

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0717]/85 backdrop-blur-2xl px-4 py-3.5 sm:px-6 xl:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Eyebrow + Breadcrumb + Title */}
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
          <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">{title}</h1>
        </div>

        {/* Right: Quick Search + Notifications + View Store */}
        <div className="flex items-center gap-3">
          <div className="relative hidden w-64 md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="search"
              placeholder="Search assets, orders, customers..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-text-muted transition-colors hover:text-white hover:bg-white/[0.1]"
            title="Notifications"
          >
            <FiBell className="text-base" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <Link
            to="/store"
            target="_blank"
            className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:scale-[1.02]"
          >
            <FiExternalLink />
            <span className="hidden sm:inline">View Public Store</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
