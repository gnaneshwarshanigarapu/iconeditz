import React from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05020a] px-4">
      <Seo title="Page Not Found" description="The requested page could not be found on Icon Editz." canonicalPath="/404" />
      <div className="max-w-xl rounded-[2rem] border border-primary/20 bg-white/5 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.32em] text-primary">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-base leading-8 text-text-muted">The page you are looking for has moved, been removed, or never existed.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">Return Home</Link>
      </div>
    </div>
  )
}
