import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function CmsCta() {
  const [content, setContent] = useState(null)

  useEffect(() => {
    supabase.from('cta_content').select('content').eq('id', true).single()
      .then(({ data }) => setContent(data?.content || null))
  }, [])

  if (!content || content.visible === false) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:pb-24">
      <div
        className="overflow-hidden rounded-[2rem] border border-primary/20 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-12"
        style={{ backgroundImage: `${content.backgroundImage ? `url(${content.backgroundImage}), ` : ''}${content.backgroundGradient || ''}` }}
      >
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{content.heading}</h2>
          {content.subheading && <p className="mt-4 text-lg leading-8 text-text-muted">{content.subheading}</p>}
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          {content.primaryButton && content.primaryButtonUrl && (
            <Link to={content.primaryButtonUrl} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-light px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25">
              {content.primaryButton} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {content.secondaryButton && content.secondaryButtonUrl && (
            <Link to={content.secondaryButtonUrl} className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              {content.secondaryButton}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
