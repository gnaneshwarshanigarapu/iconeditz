import React from 'react'
import { motion } from 'framer-motion'
import { FiFilm, FiMusic, FiSliders, FiZap } from 'react-icons/fi'
import { fadeInUp, staggerContainer } from '../utils/animations'

const services = [
  {
    title: 'Reels & Status Edits',
    description: 'Punchy short-form edits with fast beat cuts, transitions, captions, and mobile-first framing.',
    icon: FiZap,
  },
  {
    title: 'Wedding Films',
    description: 'Cinematic highlight edits for pre-wedding, wedding, and event memories with smooth pacing.',
    icon: FiFilm,
  },
  {
    title: '3D Lyric Videos',
    description: 'Animated typography, depth, glow, camera movement, and timing built around the song.',
    icon: FiMusic,
  },
  {
    title: 'Color & Polish',
    description: 'Color grading, cleanup, overlays, sound balance, and export-ready finishing for every platform.',
    icon: FiSliders,
  },
]

export default function Services() {
  return (
    <section id="services" className="relative py-20 md:py-32">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Services</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <motion.div key={service.title} variants={fadeInUp} className="glass-effect rounded-xl p-6 hover:border-primary/50 transition-all">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-text-muted">{service.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
