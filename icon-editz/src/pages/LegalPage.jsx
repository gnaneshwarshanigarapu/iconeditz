import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCms } from '../services/cms'

export default function LegalPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getCms({ section: 'legal', slug })
      .then((data) => { setPage(data?.title ? data : null); setError('') })
      .catch((requestError) => { setPage(null); setError(requestError.message || 'Content is unavailable.') })
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
