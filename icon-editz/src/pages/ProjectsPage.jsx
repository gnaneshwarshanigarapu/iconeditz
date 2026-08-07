import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Projects from '../components/Projects'
import Seo from '../components/Seo'
import PageSkeleton from '../components/loading/PageSkeleton'
import { useCmsPage } from '../services/cms'

export default function ProjectsPage() {
  const { content, loading } = useCmsPage('Projects Page')
  const seo = content.SEO || {}

  return (
    <>
      <Seo title={seo.title || 'Projects'} description={seo.description || 'Browse featured video editing and motion graphics projects completed by Icon Editz.'} canonical={seo.canonical || 'https://iconeditz.com/projects'} />
      <AnimatePresence mode="wait">
        {loading ? (
          <PageSkeleton key="projects-skeleton" page="Projects" />
        ) : (
          <motion.div
            key="projects-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.35 } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Projects />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
