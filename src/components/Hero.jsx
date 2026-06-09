import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiMousePointer } from 'react-icons/fi'
import { FaInstagram, FaYoutube } from 'react-icons/fa'
import { AiOutlineMail } from 'react-icons/ai'
import { fadeInUp, staggerContainer } from '../utils/animations'
import { scrollToSection } from '../utils/helpers'

export default function Hero() {
  const words = ['Video Editor', 'Motion Designer', 'Content Creator']
  const [currentWord, setCurrentWord] = useState(0)
  const pointerRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let frameId
    const target = pointerRef.current

    const handleMove = (event) => {
      if (!target) return
      const x = event.clientX
      const y = event.clientY

      if (frameId) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        target.style.left = `${x}px`
        target.style.top = `${y}px`
        target.style.opacity = '1'
      })
    }

    const handleLeave = () => {
      if (!target) return
      if (frameId) cancelAnimationFrame(frameId)
      target.style.opacity = '0'
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseout', handleLeave)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseout', handleLeave)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <section id="hero" className="relative min-h-screen pt-20 overflow-hidden lg:cursor-none">
      {/* Cursor effect */}
      <div
        ref={pointerRef}
        className="fixed left-0 top-0 pointer-events-none z-50 hidden lg:flex items-center justify-center opacity-0 transition-all duration-150"
        style={{ width: 60, height: 60, transform: 'translate(-50%, -50%)' }}
      >
        <div className="absolute inset-0 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-xl" />
        <div className="relative flex items-center justify-center h-full w-full">
          <span className="h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_20px_rgba(157,92,255,0.4)]" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background -z-10" />
      <div className="purple-grid absolute inset-0 -z-10 opacity-45" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container-custom max-w-6xl mx-auto px-4 z-10"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div variants={fadeInUp} className="space-y-10 text-center lg:text-left">
            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto lg:mx-0">
              <p className="text-sm uppercase tracking-[0.4em] text-primary mb-6">// Video Editor & Motion Designer</p>
              <h1 className="text-6xl md:text-8xl lg:text-[5.5rem] font-bold leading-tight">
                <span className="text-gradient">Hi, I'm </span>
                <span className="text-text">Nani</span>
              </h1>
              <div className="mt-8 text-3xl md:text-5xl font-black text-gradient">
                {words[currentWord]}
              </div>
              <p className="mt-8 text-base md:text-lg text-text-muted max-w-2xl">
                Premium edits, motion graphics, short-form reels, wedding films, lyric videos, and YouTube content crafted with clean rhythm, cinematic detail, and a future-ready creative system.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(157, 92, 255, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('projects')}
                className="px-8 py-4 bg-gradient-purple rounded-lg text-text font-bold flex items-center justify-center gap-2 hover:shadow-glow-purple-lg transition-all"
              >
                View Work
                <FiArrowRight />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, borderColor: '#9D5CFF' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 border-2 border-primary rounded-lg text-text font-bold hover:bg-primary/10 transition-all"
              >
                Get in Touch
              </motion.button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center lg:justify-start gap-5"
            >
              <motion.a
                href="mailto:shanigarapugnaneshwar@gmail.com"
                whileHover={{ scale: 1.2, color: '#9D5CFF' }}
                className="text-2xl text-text-muted hover:text-primary transition-colors"
                aria-label="Email"
              >
                <AiOutlineMail />
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
                href="https://www.instagram.com/icon._editz/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2, color: '#9D5CFF' }}
                className="text-2xl text-text-muted hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram />
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative mx-auto w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[48px] border border-primary/30 bg-[#1f0f35]/80 p-6 shadow-[0_40px_120px_rgba(157,92,255,0.12)] backdrop-blur-xl">
              <div className="absolute -right-10 top-12 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -left-10 bottom-10 h-24 w-24 rounded-full bg-[#ffffff10] blur-3xl" />

              <div className="rounded-[36px] bg-[#190b2b] border border-white/5 p-6 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <div className="h-3 w-16 rounded-full bg-primary/40" />
                    <div className="h-2 w-24 rounded-full bg-white/10" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="h-3 w-3 rounded-full bg-yellow-300" />
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                </div>

                <div className="relative h-[360px] rounded-[28px] bg-gradient-to-br from-[#4927f3]/40 via-[#5d4bff]/20 to-[#140627]/40 border border-white/10 overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="absolute left-6 top-6 h-4 w-24 rounded-full bg-white/10" />
                  <div className="absolute left-6 bottom-6 h-4 w-28 rounded-full bg-white/10" />
                  <div className="absolute right-6 top-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
                  <div className="absolute inset-x-8 bottom-20 h-2 rounded-full bg-primary/30" />
                  <div className="absolute inset-x-12 top-16 h-2 rounded-full bg-white/20" />
                  <div className="absolute left-8 top-28 h-2 w-16 rounded-full bg-white/20" />
                  <div className="absolute right-8 top-28 h-2 w-20 rounded-full bg-white/20" />
                  <div className="absolute inset-x-10 top-44 h-16 rounded-3xl bg-[#0f0821]/80 border border-white/5" />
                  <div className="absolute bottom-8 left-10 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-[#1d0f38] border border-white/10 flex items-center justify-center text-primary text-xl font-bold">
                      IE
                    </div>
                    <div>
                      <p className="text-sm text-white/70 uppercase tracking-[0.22em]">Icon Editz</p>
                      <p className="text-xs text-white/40">Creative Studio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute left-1/2 bottom-8 z-20 flex -translate-x-1/2 flex-col items-center gap-3 text-center text-xs uppercase tracking-[0.3em] text-text-muted"
      >
        <button
          type="button"
          onClick={() => scrollToSection('projects')}
          className="inline-flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-colors"
        >
          <span className="rounded-full border border-white/20 px-3 py-2 bg-black/40 backdrop-blur-md">Scroll Down</span>
          <span className="h-10 w-10 rounded-full border border-primary/50 flex items-center justify-center text-primary/80">
            <FiMousePointer className="h-4 w-4 animate-bounce" />
          </span>
        </button>
      </motion.div>
    </section>
  )
}
