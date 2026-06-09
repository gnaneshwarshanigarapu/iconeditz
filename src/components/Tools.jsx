import React from 'react'
import { motion } from 'framer-motion'
import { toolsData } from '../data/tools'
import { staggerContainer, fadeInUp, scaleIn } from '../utils/animations'
import { BsCameraVideo, BsStars } from 'react-icons/bs'
import { FiCpu, FiLayers, FiScissors } from 'react-icons/fi'

export default function Tools() {
  const iconMap = {
    CapCut: FiScissors,
    'Adobe Premiere Pro': FiLayers,
    'Adobe After Effects': FiCpu,
    'DaVinci Resolve': BsCameraVideo,
  }

  return (
    <section id="tools" className="relative py-20 md:py-32">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Title */}
          <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Tools & Software</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full" />
          </motion.div>

          {/* Tools Grid */}
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolsData.map((tool, index) => {
              const IconComponent = iconMap[tool.name] || BsStars

              return (
                <motion.div
                  key={tool.id}
                  variants={scaleIn}
                  custom={index}
                  whileHover={{
                    y: -10,
                    boxShadow: '0 0 40px rgba(157, 92, 255, 0.6)',
                  }}
                  className="glass-effect relative p-8 rounded-xl text-center group cursor-pointer border border-primary/20 hover:border-primary/50 transition-all"
                >
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="text-5xl text-primary group-hover:text-primary-light transition-colors"
                    >
                      <IconComponent />
                    </motion.div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-text mb-3">{tool.name}</h3>

                  {/* Description */}
                  <p className="text-text-muted text-sm mb-6">{tool.description}</p>

                  {/* Proficiency Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-text-muted">Proficiency</span>
                      <span className="text-sm font-bold text-primary">
                        {tool.proficiency}%
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tool.proficiency}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="h-full bg-gradient-purple rounded-full"
                      />
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-purple opacity-0 group-hover:opacity-5 transition-opacity blur-xl -z-10" />
                </motion.div>
              )
            })}
          </motion.div>

          {/* Additional Software */}
          <motion.div variants={fadeInUp} className="mt-16 p-8 glass-effect rounded-xl">
            <h3 className="text-2xl font-bold mb-6">Additional Software Experience</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'Filmora',
                'HitFilm Express',
                'Vegas Pro',
                'Lightroom',
                'Photoshop',
                'Audition',
                'Blender',
                'Cinema 4D',
              ].map((software) => (
                <motion.div
                  key={software}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-3 bg-surface rounded-lg text-center text-text-muted hover:text-primary transition-colors"
                >
                  {software}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
