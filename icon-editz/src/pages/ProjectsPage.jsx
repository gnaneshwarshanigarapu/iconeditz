import React from 'react'
import Projects from '../components/Projects'
import Seo from '../components/Seo'
import CmsPageContent from '../components/CmsPageContent'

export default function ProjectsPage() {
  return (
    <>
      <Seo title="Projects" description="Browse featured video editing and motion graphics projects completed by Icon Editz." canonicalPath="/projects" />
      <CmsPageContent page="Projects Page" fallbackTitle="Featured Projects" fallbackDescription="Selected creative work from Icon Editz." />
      <Projects />
    </>
  )
}
