import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function LegalPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) { setError('Content is unavailable until Supabase is configured.'); return }
    supabase.from('legal_pages').select('title, content, seo_title, seo_description, updated_at')
      .eq('slug', slug).eq('published', true).single()
      .then(({ data, error: requestError }) => {
        setPage(data || null)
        setError(requestError?.message || '')
      })
  }, [slug])

  if (error || !page) return <section className="mx-auto max-w-3xl px-6 pb-24 pt-36 text-white"><h1 className="text-3xl font-bold">Page not found</h1></section>

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-36 text-white lg:px-8">
      <p className="text-sm text-text-muted">Last updated {new Date(page.updated_at).toLocaleDateString()}</p>
      <h1 className="mt-3 text-4xl font-bold">{page.title}</h1>
      <article className="mt-10 whitespace-pre-wrap text-base leading-8 text-text-muted">{page.content}</article>
    </section>
  )
}
