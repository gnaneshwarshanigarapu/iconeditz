import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Services from '../components/Services'
import Seo from '../components/Seo'
import PageSkeleton from '../components/loading/PageSkeleton'
import { useCmsPage } from '../services/cms'

export default function ServicesPage() {
  const { content, loading } = useCmsPage('Services Page')
  const seo = content.SEO || {}

  return (
    <>
      <Seo title={seo.title || 'Services'} description={seo.description || 'Explore premium video editing, motion graphics, and creative services from Icon Editz.'} canonical={seo.canonical || 'https://iconeditz.com/services'} />
      <AnimatePresence mode="wait">
        {loading ? (
          <PageSkeleton key="services-skeleton" page="Services" />
        ) : (
          <motion.div
            key="services-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.35 } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Services />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
