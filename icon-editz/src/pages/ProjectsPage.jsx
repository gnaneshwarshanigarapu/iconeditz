import React from 'react'
import Projects from '../components/Projects'
import Seo from '../components/Seo'

export default function ProjectsPage() {
  return (
    <>
      <Seo title="Projects" description="Browse featured video editing and motion graphics projects completed by Icon Editz." canonicalPath="/projects" />
      <Projects />
    </>
  )
}
