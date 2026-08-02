import { useMemo } from 'react'
import { useCmsPage } from '../services/cms'
import { defaultSiteContent } from '../data/defaultSiteContent'
import { defaultServicesPage } from '../data/defaultServicesPage'

const hasContent = (value) => {
  if (Array.isArray(value)) return value.length > 0
  if (value && typeof value === 'object') return Object.keys(value).length > 0
  return Boolean(value)
}

// Compatibility facade for legacy presentation components. Published content is
// loaded from the single CMS service; bundled defaults are only a safe fallback.
export const useSiteContent = () => {
  const { content: sections, loading } = useCmsPage('Homepage')
  const { content: servicesPage, loading: servicesLoading } = useCmsPage('Services Page')

  const content = useMemo(() => {
    const cmsServicesSection = servicesPage.Services || servicesPage['Services'] || {}
    const cmsPricingSection = servicesPage.Pricing || servicesPage['Pricing'] || {}
    const cmsFaqSection = servicesPage.FAQ || servicesPage['FAQ'] || {}
    const cmsTestimonialsSection = servicesPage.Testimonials || servicesPage['Testimonials'] || {}
    const cmsHeroSection = servicesPage.Hero || servicesPage['Hero'] || {}
    const cmsCtaSection = servicesPage.CTA || servicesPage['CTA'] || {}
    const servicesPageContent = hasContent(cmsServicesSection) ? cmsServicesSection : defaultServicesPage
    const featuredServicesSection = sections['Featured Services'] || servicesPage['Featured Services']
    const homeServices = hasContent(featuredServicesSection)
      ? { ...defaultServicesPage.homeServices, ...featuredServicesSection }
      : defaultServicesPage.homeServices

    return {
      hero: hasContent(sections.Hero) ? sections.Hero : defaultSiteContent.hero,
      showreel: hasContent(sections.Showreel) ? sections.Showreel : defaultSiteContent.showreel,
      services: hasContent(sections.Services) ? sections.Services : defaultSiteContent.services,
      projects: hasContent(sections.Projects) ? sections.Projects : defaultSiteContent.projects,
      tools: hasContent(sections.Tools) ? sections.Tools : defaultSiteContent.tools,
      testimonials: hasContent(sections.Testimonials) ? sections.Testimonials : defaultSiteContent.testimonials,
      faq: hasContent(sections.FAQ) ? sections.FAQ : defaultSiteContent.faq,
      cta: hasContent(sections.CTA) ? sections.CTA : defaultSiteContent.cta,
      site: hasContent(sections.Site) ? sections.Site : defaultSiteContent.site,
      servicesPage: {
        ...defaultServicesPage,
        ...servicesPage,
        hero: { ...defaultServicesPage.hero, ...cmsHeroSection },
        cta: { ...defaultServicesPage.cta, ...cmsCtaSection },
        services: hasContent(cmsServicesSection?.items) ? cmsServicesSection.items : defaultServicesPage.services,
        packages: hasContent(cmsPricingSection?.items) ? cmsPricingSection.items : defaultServicesPage.packages,
        faq: hasContent(cmsFaqSection?.items) ? cmsFaqSection.items : defaultServicesPage.faq,
        testimonials: hasContent(cmsTestimonialsSection?.items) ? cmsTestimonialsSection.items : defaultServicesPage.testimonials,
        homeServices,
      },
    }
  }, [sections, servicesPage])

  return { content, isHydrated: !loading && !servicesLoading }
}
