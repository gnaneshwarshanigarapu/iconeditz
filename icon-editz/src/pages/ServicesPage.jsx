import React from 'react'
import Services from '../components/Services'
import Seo from '../components/Seo'
import { useCmsPage } from '../services/cms'

export default function ServicesPage() {
  const { content } = useCmsPage('Services Page')
  const seo = content.SEO || {}

  return (
    <>
      <Seo title={seo.title || 'Services'} description={seo.description || 'Explore premium video editing, motion graphics, and creative services from Icon Editz.'} canonical={seo.canonical || 'https://iconeditz.com/services'} />
      <Services />
    </>
  )
}
