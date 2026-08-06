import { useMemo } from 'react'
import { useCmsPage } from '../services/cms'

const DEFAULT_HERO = {
  heading: 'CRAFTING HIGH-IMPACT VIDEO EDITS & MOTION GRAPHICS',
  subtitle: 'We turn raw footage into cinematic storytelling.',
  description: 'Specializing in Instagram Reels, Wedding Highlights, 3D Lyric Videos, and YouTube Motion Graphics.',
  badges: ['After Effects', 'Premiere Pro', 'Cinema 4D', 'DaVinci Resolve'],
}

const DEFAULT_SHOWREEL = {
  title: 'Showreel 2026',
  description: 'A cinematic preview of the full experience.',
  videoUrl: 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031466505-37054005-3d-lyrics-video-1.mp4',
  buttonText: 'View Projects',
}

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
      hero: { ...DEFAULT_HERO, ...(sections.Hero || {}) },
      showreel: { ...DEFAULT_SHOWREEL, ...(sections.Showreel || {}) },
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
