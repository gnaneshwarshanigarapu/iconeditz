import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import SectionShell from './SectionShell'
import ImageWithFallback from '../ui/ImageWithFallback'

const FeaturedProjectsSection = memo(function FeaturedProjectsSection({ visibleProjects }) {
  if (!visibleProjects || visibleProjects.length === 0) return null

  return (
    <SectionShell
      id="projects"
      eyebrow="Featured Projects"
      title="Three standout collaborations that reflect the studio’s best work"
      description="The homepage highlights only the strongest work so the story stays focused and premium."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {visibleProjects.map((project, index) => (
          <motion.div
            key={project.id || project.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="relative aspect-video overflow-hidden bg-black">
              <ImageWithFallback
                src={project.thumbnail || '/assets/images/og-icon-editz.png'}
                alt={project.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                <div className="rounded-full bg-primary/90 p-4 text-white">
                  <Play className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">{project.category || 'Portfolio'}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{project.title}</h3>
              <p className="mt-3 text-sm leading-8 text-text-muted">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
})

export default FeaturedProjectsSection
