import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Play, ArrowRight } from 'lucide-react'
import SectionShell from './SectionShell'
import VideoWithPlaceholder from '../ui/VideoWithPlaceholder'
import { resolveVideoUrl } from '../../utils/media'

const cardMotion = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const ShowreelSection = memo(function ShowreelSection({ showreel }) {
  if (!showreel) return null

  const videoSrc = resolveVideoUrl(showreel.videoUrl)

  return (
    <SectionShell
      id="showreel"
      eyebrow="Showreel"
      title="A cinematic preview of the full experience"
      description="A focused preview that opens into a richer story when you choose to explore more."
    >
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <motion.div
          variants={cardMotion}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[2rem] border border-primary/20 bg-[#0d0718]/80 shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
        >
          <div className="relative aspect-video bg-black">
            <VideoWithPlaceholder
              src={videoSrc}
              poster={showreel.thumbnail}
              title={showreel.title}
              className="h-full w-full"
            />
          </div>
        </motion.div>
        <motion.div
          variants={cardMotion}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 p-3 text-primary">
            <Play className="h-5 w-5" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-white">{showreel.title}</h3>
          <p className="mt-4 text-base leading-8 text-text-muted">{showreel.description}</p>
          <a
            href="/projects"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
          >
            {showreel.buttonText || 'View Projects'} <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </SectionShell>
  )
})

export default ShowreelSection
