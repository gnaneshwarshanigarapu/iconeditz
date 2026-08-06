import { useMemo } from 'react'
import { useCmsPage } from '../services/cms'

export const useSiteContent = () => {
  const { content: sections, loading } = useCmsPage('Homepage')
  const { content: servicesPage, loading: servicesLoading } = useCmsPage('Services Page')

  const content = useMemo(() => {
    const cmsServicesSection = servicesPage.Services || {}
    const cmsPricingSection = servicesPage.Pricing || {}
    const cmsFaqSection = servicesPage.FAQ || {}
    const cmsTestimonialsSection = servicesPage.Testimonials || {}
    const cmsHeroSection = servicesPage.Hero || {}
    const cmsCtaSection = servicesPage.CTA || {}
    const featuredServicesSection = sections['Featured Services'] || servicesPage['Featured Services'] || {}

    return {
      hero: sections.Hero || {},
      showreel: sections.Showreel || {},
      services: sections.Services || {},
      projects: sections.Projects || {},
      tools: sections.Tools || {},
      testimonials: sections.Testimonials || {},
      faq: sections.FAQ || {},
      cta: sections.CTA || {},
      site: sections.Site || {},
      servicesPage: {
        ...servicesPage,
        hero: cmsHeroSection,
        cta: cmsCtaSection,
        services: cmsServicesSection?.items || [],
        packages: cmsPricingSection?.items || [],
        faq: cmsFaqSection?.items || [],
        testimonials: cmsTestimonialsSection?.items || [],
        homeServices: featuredServicesSection,
      },
    }
  }, [sections, servicesPage])

  return { content, isHydrated: !loading && !servicesLoading }
}
