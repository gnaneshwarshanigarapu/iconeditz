export const siteMetadata = {
  title: 'Icon Editz | Premium Video Editing & Motion Graphics',
  description:
    'Premium video editing, motion graphics, and creative storytelling for brands, creators, and digital launches.',
  canonical: 'https://iconeditz.com/',
  ogImage: 'https://iconeditz.com/assets/images/og-icon-editz.png',
  twitterHandle: '@iconeditz',
}

export const getPageMetadata = (pageTitle, description, canonicalPath = '/') => ({
  title: pageTitle ? `${pageTitle} | Icon Editz` : siteMetadata.title,
  description: description || siteMetadata.description,
  canonical: `https://iconeditz.com${canonicalPath}`,
})
