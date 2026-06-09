import React from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp, fadeInLeft, fadeInRight } from '../utils/animations'

export default function About() {
  const stats = [
    { label: 'Lyric Videos', value: '3D' },
    { label: 'Projects Done', value: '10+' },
    { label: 'Pro Tools', value: '4+' },
    { label: 'Creativity', value: '100%' },
  ]

  const personalInfo = [
    { label: 'Name', value: 'Nani' },
    { label: 'Birthday', value: '22 Nov 2002' },
    { label: 'Location', value: 'Jagital, Telangana' },
    { label: 'Phone', value: '+91 9346084649' },
  ]

  return (
    <section id="about" className="relative py-20 md:py-32">
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
              <span className="text-gradient">About Me</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {/* Left Content */}
            <motion.div variants={fadeInLeft} className="space-y-6">
              <p className="text-lg text-text-muted leading-relaxed">
                I'm a passionate and creative video editor with hands-on experience across reels, YouTube content, wedding videos, birthday celebrations, and 3D lyric videos.
              </p>

              <p className="text-lg text-text-muted leading-relaxed">
                My journey began during college days, where I discovered a love for storytelling and visual design. Transforming raw footage into compelling narratives is what drives me.
              </p>

              <p className="text-lg text-text-muted leading-relaxed">
                Whether it's a heartfelt wedding video, a dynamic reel, or a visually stunning 3D lyric video, every project gets full commitment.
              </p>

              {/* Personal Info Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {personalInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    className="glass-effect p-4 rounded-lg hover:border-primary/50 transition-all"
                  >
                    <p className="text-text-muted text-sm">{info.label}</p>
                    <p className="text-text font-semibold">{info.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Stats */}
            <motion.div variants={fadeInRight} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    className="glass-effect p-6 rounded-xl text-center hover:border-primary/50 transition-all glow-purple"
                  >
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-3xl md:text-4xl font-bold text-gradient mb-2"
                    >
                      {stat.value}
                    </motion.h3>
                    <p className="text-text-muted text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Skills */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-bold mb-6">Core Skills</h3>
                {[
                  { skill: 'Video Editing', level: 95 },
                  { skill: 'Motion Graphics', level: 90 },
                  { skill: 'Color Grading', level: 85 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-text">{item.skill}</span>
                      <span className="text-primary font-bold">{item.level}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.level}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="h-full bg-gradient-purple rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
