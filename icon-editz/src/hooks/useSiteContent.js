import { useMemo } from 'react'
import { useCmsPage } from '../services/cms'

// Compatibility facade for legacy presentation components. Published content is
// loaded from the single CMS service; bundled defaults are only a safe fallback.
export const useSiteContent = () => {
  const { content: sections, loading } = useCmsPage('Homepage')
  const { content: servicesPage, loading: servicesLoading } = useCmsPage('Services Page')
  const content = useMemo(() => ({
    hero: sections.Hero || {}, showreel: sections.Showreel || {}, services: sections.Services || {}, projects: sections.Projects || {}, tools: sections.Tools || {}, testimonials: sections.Testimonials || {}, faq: sections.FAQ || {}, cta: sections.CTA || {}, site: sections.Site || {},
    servicesPage: { ...servicesPage.Services, homeServices: sections['Featured Services'] || servicesPage['Featured Services'] || {} },
  }), [sections, servicesPage])

  return { content, isHydrated: !loading && !servicesLoading }
}
