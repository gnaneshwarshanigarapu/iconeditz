import React from 'react'
import About from '../components/About'
import Seo from '../components/Seo'
import { useCmsPage } from '../services/cms'

export default function AboutPage() {
  const { content } = useCmsPage('About Page')
  const seo = content.SEO || {}

  return (
    <>
      <Seo title={seo.title || 'About'} description={seo.description || 'Learn more about Icon Editz, the creative studio behind premium editing and motion graphics.'} canonical={seo.canonical || 'https://iconeditz.com/about'} />
      <About />
    </>
  )
}
