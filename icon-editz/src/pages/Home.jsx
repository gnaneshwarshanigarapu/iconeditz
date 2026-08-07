import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PremiumHomepage from '../components/PremiumHomepage'
import PageSkeleton from '../components/loading/PageSkeleton'
import Seo from '../components/Seo'
import { useCmsPage } from '../services/cms'
import { useSiteContent } from '../hooks/useSiteContent'
import { organization, website } from '../utils/schema'

export default function Home() {
  const { content, loading } = useCmsPage('Homepage')
  const { isHydrated } = useSiteContent()
  const seo = content.SEO || {}
  const isLoading = loading || !isHydrated

  useEffect(() => {
    const activeElement = document.activeElement
    const isEditable = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement?.isContentEditable

    if (isEditable) activeElement.blur()

    // Preload critical homepage assets
    const assetsToPreload = [
      '/assets/logos/icon-editz.jpg',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80',
    ]
    assetsToPreload.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  return (
    <div className="relative min-h-screen bg-[#05020a]">
      <Seo 
        title={seo.title || 'Icon Editz - Premium Video Editing & Motion Graphics'} 
        description={seo.description || 'Premium video editing, motion graphics, and creative storytelling by Icon Editz. We bring your vision to life.'} 
        canonical={seo.canonical || 'https://iconeditz.com/'}
        schema={[organization, website]}
      />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <PageSkeleton key="home-skeleton" page="Home" />
        ) : (
          <motion.div
            key="home-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.35 } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <PremiumHomepage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
