import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  FiBarChart2,
  FiBox,
  FiDownload,
  FiLogOut,
  FiPlusCircle,
  FiSettings,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: FiBarChart2, end: true },
  { label: 'Products', to: '/admin/products', icon: FiBox },
  { label: 'Add Product', to: '/admin/products/add', icon: FiPlusCircle },
  { label: 'Orders', to: '/admin/orders', icon: FiShoppingBag },
  { label: 'Customers', to: '/admin/customers', icon: FiUsers },
  { label: 'Downloads', to: '/admin/downloads', icon: FiDownload },
  { label: 'Settings', to: '/admin/settings', icon: FiSettings },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#0f0a1f]/90 px-4 py-5 text-text shadow-2xl shadow-black/30 backdrop-blur-2xl lg:flex lg:flex-col">
      <div className="mb-8 rounded-xl border border-primary/20 bg-white/[0.04] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Icon Editz</p>
        <h2 className="mt-2 text-xl font-bold text-white">Seller Admin</h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'border border-primary/30 bg-primary/20 text-white shadow-lg shadow-primary/10'
                    : 'text-text-muted hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              <Icon className="text-lg" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-6 flex items-center gap-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-3 text-left text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20"
      >
        <FiLogOut className="text-lg" />
        <span>Logout</span>
      </button>
    </aside>
  )
}
