import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { siteMetadata } from './utils/seo'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Icon Editz',
  founder: 'Nani',
  description: 'Premium video editing, motion graphics, and content creation services.',
  areaServed: 'Worldwide',
  serviceType: ['Video Editing', 'Motion Graphics', 'Content Creation'],
  url: 'https://iconeditz.com/',
}

document.title = siteMetadata.title

const metaDescription = document.querySelector('meta[name="description"]')
if (metaDescription) metaDescription.setAttribute('content', siteMetadata.description)

const canonical = document.querySelector('link[rel="canonical"]')
if (canonical) canonical.setAttribute('href', siteMetadata.canonical)

const seoScript = document.createElement('script')
seoScript.type = 'application/ld+json'
seoScript.text = JSON.stringify(structuredData)
document.head.appendChild(seoScript)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
