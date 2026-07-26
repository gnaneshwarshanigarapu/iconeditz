import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageMetadata, siteMetadata } from '../utils/seo'

export default function Seo({ title, description, canonicalPath, image, type = 'website' }) {
  const location = useLocation()

  useEffect(() => {
    if (typeof document === 'undefined') return

    const metadata = getPageMetadata(title, description, canonicalPath || location.pathname)
    const resolvedTitle = metadata.title || siteMetadata.title
    const resolvedDescription = metadata.description || siteMetadata.description
    const resolvedCanonical = metadata.canonical || siteMetadata.canonical
    const resolvedImage = image || siteMetadata.ogImage

    document.title = resolvedTitle

    const setMetaTag = (attr, value, content) => {
      const tag = document.querySelector(`meta[${attr}="${value}"]`)
      if (tag) {
        tag.setAttribute('content', content)
        return tag
      }

      const meta = document.createElement('meta')
      meta.setAttribute(attr, value)
      meta.setAttribute('content', content)
      document.head.appendChild(meta)
      return meta
    }

    setMetaTag('name', 'description', resolvedDescription)
    setMetaTag('property', 'og:title', resolvedTitle)
    setMetaTag('property', 'og:description', resolvedDescription)
    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:url', resolvedCanonical)
    setMetaTag('property', 'og:image', resolvedImage)
    setMetaTag('name', 'twitter:title', resolvedTitle)
    setMetaTag('name', 'twitter:description', resolvedDescription)
    setMetaTag('name', 'twitter:image', resolvedImage)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1')

    let canonicalTag = document.querySelector('link[rel="canonical"]')
    if (!canonicalTag) {
      canonicalTag = document.createElement('link')
      canonicalTag.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalTag)
    }
    canonicalTag.setAttribute('href', resolvedCanonical)

    let structuredDataTag = document.getElementById('app-structured-data')
    if (structuredDataTag) structuredDataTag.remove()

    structuredDataTag = document.createElement('script')
    structuredDataTag.id = 'app-structured-data'
    structuredDataTag.type = 'application/ld+json'
    structuredDataTag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Icon Editz',
      founder: 'Nani',
      description: resolvedDescription,
      url: resolvedCanonical,
      areaServed: 'Worldwide',
      serviceType: ['Video Editing', 'Motion Graphics', 'Content Creation'],
    })
    document.head.appendChild(structuredDataTag)
  }, [canonicalPath, description, image, location.pathname, title, type])

  return null
}
