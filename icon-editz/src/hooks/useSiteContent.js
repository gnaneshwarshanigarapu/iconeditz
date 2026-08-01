import { useMemo } from 'react'
import { defaultSiteContent } from '../data/defaultSiteContent'
import { useCmsPage } from '../services/cms'

const asHero = (fallback, content = {}) => ({
  ...fallback,
  ...content,
  primaryCta: content.primaryLabel || fallback.primaryCta,
  primaryHref: content.primaryUrl || fallback.primaryHref,
  secondaryCta: content.secondaryLabel || fallback.secondaryCta,
  secondaryHref: content.secondaryUrl || fallback.secondaryHref,
  backgroundImage: content.imageUrl || fallback.backgroundImage,
  backgroundVideo: content.videoUrl || fallback.backgroundVideo,
})

// Compatibility facade for legacy presentation components. Published content is
// loaded from the single CMS service; bundled defaults are only a safe fallback.
export const useSiteContent = () => {
  const { content: sections, loading } = useCmsPage('Homepage')
  const content = useMemo(() => ({
    ...defaultSiteContent,
    hero: asHero(defaultSiteContent.hero, sections.Hero),
    servicesPage: {
      ...defaultSiteContent.servicesPage,
      homeServices: {
        ...defaultSiteContent.servicesPage.homeServices,
        ...(sections['Featured Services'] || {}),
      },
    },
  }), [sections])

  return { content, isHydrated: !loading }
}
