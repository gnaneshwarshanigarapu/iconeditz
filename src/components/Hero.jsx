import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { FaInstagram, FaYoutube } from 'react-icons/fa'
import { AiOutlineMail } from 'react-icons/ai'
import { fadeInUp, staggerContainer } from '../utils/animations'
import { scrollToSection } from '../utils/helpers'

export default function Hero() {
  const words = ['Video Editor', 'Motion Designer', 'Content Creator']
  const [currentWord, setCurrentWord] = React.useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="hero" className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background -z-10" />
      <div className="purple-grid absolute inset-0 -z-10 opacity-45" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container-custom max-w-5xl mx-auto px-4 z-10"
      >
        {/* Main Heading */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-text">Hi, I'm </span>
            <span className="text-gradient">Nani</span>
          </motion.h1>

          {/* Typing Effect */}
          <div className="h-20 md:h-24 flex items-center justify-center mb-8">
            <motion.div
              key={currentWord}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-gradient"
            >
              {words[currentWord]}
            </motion.div>
          </div>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed"
          >
            Premium edits, motion graphics, short-form reels, wedding films, lyric videos, and YouTube content crafted with clean rhythm, cinematic detail, and a future-ready creative system.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(157, 92, 255, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('projects')}
            className="px-8 py-4 bg-gradient-purple rounded-lg text-text font-bold flex items-center justify-center gap-2 hover:shadow-glow-purple-lg transition-all"
          >
            View Projects
            <FiArrowRight />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, borderColor: '#9D5CFF' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('contact')}
            className="px-8 py-4 border-2 border-primary rounded-lg text-text font-bold hover:bg-primary/10 transition-all"
          >
            Contact Me
          </motion.button>
        </motion.div>

        {/* Social Icons */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center gap-6"
        >
          <motion.a
            href="https://www.instagram.com/icon._editz/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, color: '#9D5CFF' }}
            className="text-2xl text-text-muted hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <FaInstagram />
          </motion.a>

          <motion.a
            href="https://www.youtube.com/@iconeditz143"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, color: '#9D5CFF' }}
            className="text-2xl text-text-muted hover:text-primary transition-colors"
            aria-label="YouTube"
          >
            <FaYoutube />
          </motion.a>

          <motion.a
            href="mailto:shanigarapugnaneshwar@gmail.com"
            whileHover={{ scale: 1.2, color: '#9D5CFF' }}
            className="text-2xl text-text-muted hover:text-primary transition-colors"
            aria-label="Email"
          >
            <AiOutlineMail />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center p-2">
            <motion.div className="w-1 h-2 bg-primary rounded-full" />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
