import React from 'react'
import { motion } from 'framer-motion'
import { FiPlay } from 'react-icons/fi'
import { fadeInUp, staggerContainer } from '../utils/animations'

export default function Showreel() {
  return (
    <section id="showreel" className="relative py-20 md:py-28">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeInUp} className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Showreel</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full" />
          </motion.div>

          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-8 items-stretch">
            <div className="glass-panel overflow-hidden rounded-xl border border-primary/20">
              <div className="relative aspect-video bg-surface">
                <video
                  src="/videos/3d-lyrics-video-1.mp4"
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  poster="/assets/images/og-icon-editz.png"
                />
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6 md:p-8 flex flex-col justify-center">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <FiPlay className="text-2xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fast cuts, lyric timing, clean delivery.</h3>
              <p className="text-text-muted leading-relaxed">
                A compact reel of motion graphics, birthday edits, wedding moments, status videos, and 3D lyric work built for creators who need polished video fast.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
