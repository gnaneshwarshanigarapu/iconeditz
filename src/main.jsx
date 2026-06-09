import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

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

const seoScript = document.createElement('script')
seoScript.type = 'application/ld+json'
seoScript.text = JSON.stringify(structuredData)
document.head.appendChild(seoScript)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
