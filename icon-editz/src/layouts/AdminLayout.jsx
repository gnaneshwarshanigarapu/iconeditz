import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiBell, FiBox, FiExternalLink, FiGrid, FiPlusCircle, FiSearch } from 'react-icons/fi'
import Sidebar from '../components/admin/Sidebar'

const mobileNav = [
  { label: 'Dashboard', to: '/admin', icon: FiGrid, end: true },
  { label: 'Products', to: '/admin/products', icon: FiBox },
  { label: 'Add', to: '/admin/products/add', icon: FiPlusCircle },
]

export default function AdminLayout({ children, title = 'Dashboard', eyebrow = 'Admin Console' }) {
  return (
    <div className="min-h-screen bg-[#0b0717] text-text">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(157,92,255,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,_rgba(255,255,255,0.08),transparent_24%)]" />
      <Sidebar />

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0717]/78 backdrop-blur-2xl">
          <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
                <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
              </div>

              <div className="flex items-center gap-3">
                <label className="hidden min-w-72 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-text-muted md:flex">
                  <FiSearch className="text-base" />
                  <input
                    type="search"
                    placeholder="Search products, orders, customers"
                    className="w-full bg-transparent text-white outline-none placeholder:text-text-muted"
                  />
                </label>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-text-muted transition-colors hover:text-white"
                  aria-label="Notifications"
                >
                  <FiBell />
                </button>
                <Link
                  to="/store"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover"
                >
                  <FiExternalLink />
                  <span>View Store</span>
                </Link>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto lg:hidden">
              {mobileNav.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                        isActive ? 'bg-primary/20 text-white' : 'bg-white/[0.05] text-text-muted'
                      }`
                    }
                  >
                    <Icon />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 xl:px-8">{children}</main>
      </div>
    </div>
  )
}
