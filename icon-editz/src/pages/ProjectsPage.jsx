import React from 'react'
import Projects from '../components/Projects'
import Seo from '../components/Seo'
import { useCmsPage } from '../services/cms'

export default function ProjectsPage() {
  const { content } = useCmsPage('Projects Page')
  const seo = content.SEO || {}

  return (
    <>
      <Seo title={seo.title || 'Projects'} description={seo.description || 'Browse featured video editing and motion graphics projects completed by Icon Editz.'} canonical={seo.canonical || 'https://iconeditz.com/projects'} />
      <Projects />
    </>
  )
}
