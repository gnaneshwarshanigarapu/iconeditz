import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe,
  Edit3,
  CheckCircle2,
  Eye,
  Settings,
  Layers,
  Image,
  Search,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '../../components/ui/ToastProvider'

export default function WebsitePagesPage() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [pageStates, setPageStates] = useState({
    Home: 'published',
    About: 'published',
    Services: 'published',
    Assets: 'published',
    Portfolio: 'published',
    Contact: 'published',
    'Privacy Policy': 'published',
    Terms: 'published',
    FAQ: 'published',
  })

  const pages = [
    { title: 'Home', path: '/', targetRoute: '/admin/content/homepage', description: 'Hero, Showreel, Features, Testimonials, FAQ & CTA' },
    { title: 'About', path: '/about', targetRoute: '/admin/content/about', description: 'Brand Story, Team, Timeline, Skills & Stats' },
    { title: 'Services', path: '/services', targetRoute: '/admin/content/services', description: 'Service Cards, Offerings, Process & Pricing' },
    { title: 'Assets', path: '/products', targetRoute: '/admin/content/store', description: 'Digital Storefront, Product Catalog & LUTs' },
    { title: 'Portfolio', path: '/projects', targetRoute: '/admin/content/projects', description: 'Showreel Gallery, Case Studies & Media' },
    { title: 'Contact', path: '/hire', targetRoute: '/admin/content/hire-from-us', description: 'Inquiry Form, Location & Office Details' },
    { title: 'Privacy Policy', path: '/legal/privacy', targetRoute: '/admin/content/seo', description: 'Legal compliance and data usage disclosure' },
    { title: 'Terms', path: '/legal/terms', targetRoute: '/admin/content/seo', description: 'Terms of service and customer terms' },
    { title: 'FAQ', path: '/#faq', targetRoute: '/admin/content/homepage', description: 'Frequently asked customer questions' },
  ]

  const togglePageStatus = (pageTitle) => {
    setPageStates((prev) => {
      const nextStatus = prev[pageTitle] === 'published' ? 'draft' : 'published'
      toast.info(`${pageTitle} page status changed to ${nextStatus}`)
      return { ...prev, [pageTitle]: nextStatus }
    })
  }

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto space-y-2">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl flex items-center gap-2">
              <Globe className="h-7 w-7 text-purple-400" />
              <span>CMS Page Manager</span>
            </h1>
            <p className="mt-1 text-xs text-text-muted">
              Manage website pages, live previews, publishing states, SEO metadata, media assets, and section ordering.
            </p>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search website pages..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* 3-Column Card Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((page) => {
          const status = pageStates[page.title] || 'published'
          return (
            <div
              key={page.title}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e081f]/90 p-5 shadow-xl backdrop-blur-xl space-y-4 hover:border-primary/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{page.title}</h3>
                  <button
                    onClick={() => togglePageStatus(page.title)}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${
                      status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{status}</span>
                  </button>
                </div>
                <p className="mt-0.5 text-[11px] text-text-muted font-mono">{page.path}</p>
                <p className="mt-2 text-xs text-text-muted leading-relaxed">{page.description}</p>

                {/* Quick Actions Bar */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-text-muted">
                  <Link to={page.targetRoute} className="flex items-center gap-1 hover:text-white transition-colors" title="SEO & Metadata">
                    <Settings className="h-3.5 w-3.5 text-primary" /> SEO
                  </Link>
                  <span>•</span>
                  <Link to="/admin/media" className="flex items-center gap-1 hover:text-white transition-colors" title="Media Library">
                    <Image className="h-3.5 w-3.5 text-cyan-400" /> Media
                  </Link>
                  <span>•</span>
                  <Link to={page.targetRoute} className="flex items-center gap-1 hover:text-white transition-colors" title="Section Ordering">
                    <Layers className="h-3.5 w-3.5 text-purple-400" /> Sections
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={page.targetRoute}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Content</span>
                </Link>

                <a
                  href={page.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                  title="Live Preview"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
