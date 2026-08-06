import React from 'react'
import { Link } from 'react-router-dom'
import { FiGlobe, FiEdit3, FiCheckCircle } from 'react-icons/fi'

export default function WebsitePagesPage() {
  const pages = [
    { title: 'Home', path: '/', targetRoute: '/admin/content/homepage', status: 'published' },
    { title: 'Courses', path: '/courses', targetRoute: '/admin/content/store', status: 'published' },
    { title: 'About', path: '/about', targetRoute: '/admin/content/about', status: 'published' },
    { title: 'Assets', path: '/assets', targetRoute: '/admin/content/store', status: 'published' },
    { title: 'Our Works', path: '/works', targetRoute: '/admin/content/projects', status: 'published' },
    { title: 'Hire From Us', path: '/hire', targetRoute: '/admin/content/hire-from-us', status: 'published' },
    { title: 'Privacy Policy', path: '/privacy#privacy', targetRoute: '/admin/content/seo', status: 'published' },
    { title: 'Terms & Conditions', path: '/privacy#terms', targetRoute: '/admin/content/seo', status: 'published' },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Banner Card (Matches Screenshot 2) */}
      <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-black text-white sm:text-3xl">Website Pages</h1>
        <p className="mt-1 text-xs text-text-muted">
          Choose a page card to edit database-backed CMS content, media, SEO, status, visibility, and section order.
        </p>
      </div>

      {/* 3-Column Card Grid (Matches Screenshot 2) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <div
            key={page.title}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 hover:border-primary/40 transition-all"
          >
            <div>
              <h3 className="text-lg font-bold text-white">{page.title}</h3>
              <p className="mt-0.5 text-xs text-text-muted font-mono">{page.path}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] text-text-muted font-semibold">Status:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <FiCheckCircle className="text-[10px]" /> {page.status}
                </span>
              </div>
            </div>

            <Link
              to={page.targetRoute}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#8c46ff] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-[#7b35f0] hover:scale-[1.01] transition-all"
            >
              <span>Edit</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
