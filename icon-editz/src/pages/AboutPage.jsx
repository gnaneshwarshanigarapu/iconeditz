import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import About from '../components/About'
import Seo from '../components/Seo'
import PageSkeleton from '../components/loading/PageSkeleton'
import { useCmsPage } from '../services/cms'

export default function AboutPage() {
  const { content, loading } = useCmsPage('About Page')
  const seo = content.SEO || {}

  return (
    <>
      <Seo title={seo.title || 'About'} description={seo.description || 'Learn more about Icon Editz, the creative studio behind premium editing and motion graphics.'} canonical={seo.canonical || 'https://iconeditz.com/about'} />
      <AnimatePresence mode="wait">
        {loading ? (
          <PageSkeleton key="about-skeleton" page="About" />
        ) : (
          <motion.div
            key="about-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.35 } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <About />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
