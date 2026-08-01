import React from 'react'
import { Link } from 'react-router-dom'
import { useCmsPage } from '../services/cms'

const hasText = (content = {}) => Boolean(content.eyebrow || content.heading || content.description)

export default function CmsPageContent({ page, fallbackTitle, fallbackDescription }) {
  const { content: sections } = useCmsPage(page)
  // The API already filters by the row's published status. `content.status`
  // is only an editor field and must not hide a published database row.
  const rows = Object.entries(sections)
  const hero = sections.Hero
  const nonHero = rows.filter(([section]) => section !== 'Hero' && section !== 'SEO')

  if (!hasText(hero) && nonHero.length === 0) return null

  return <>
    {hasText(hero) && <section className="relative mx-auto max-w-7xl px-6 pb-8 pt-32 lg:px-8"><div className="rounded-[2rem] border border-primary/20 bg-white/5 p-8 backdrop-blur-xl sm:p-12"><p className="text-sm uppercase tracking-[.28em] text-primary">{hero.eyebrow || page}</p><h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">{hero.heading || fallbackTitle}</h1>{(hero.description || fallbackDescription) && <p className="mt-5 max-w-3xl text-lg leading-8 text-text-muted">{hero.description || fallbackDescription}</p>}<div className="mt-7 flex flex-wrap gap-4">{hero.primaryLabel && hero.primaryUrl && <Link to={hero.primaryUrl} className="rounded-full bg-primary px-5 py-3 font-semibold text-white">{hero.primaryLabel}</Link>}{hero.secondaryLabel && hero.secondaryUrl && <Link to={hero.secondaryUrl} className="rounded-full border border-white/15 px-5 py-3 font-semibold text-white">{hero.secondaryLabel}</Link>}</div></div></section>}
    {nonHero.map(([section, content]) => hasText(content) && <section key={section} className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">{content.eyebrow || section}</p>{content.heading && <h2 className="mt-3 text-2xl font-semibold text-white">{content.heading}</h2>}{content.description && <p className="mt-3 max-w-3xl leading-7 text-text-muted">{content.description}</p>}</div></section>)}
  </>
}
