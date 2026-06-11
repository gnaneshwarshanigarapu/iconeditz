import React, { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlay, FiMousePointer, FiX } from 'react-icons/fi'
import { FaInstagram, FaYoutube } from 'react-icons/fa'
import { AiOutlineMail } from 'react-icons/ai'
import { fadeInUp, staggerContainer } from '../utils/animations'
import { scrollToSection } from '../utils/helpers'

export default function Hero() {
  const words = ['Video Editor', 'Motion Designer', 'Content Creator']
  const [currentWord, setCurrentWord] = useState(0)
  const [showreelModalOpen, setShowreelModalOpen] = useState(false)
  const canvasRef = useRef(null)
  const profile3dRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let W = window.innerWidth
    let H = window.innerHeight
    let rafId
    const particles = []

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    class Particle {
      constructor() {
        this.reset(true)
      }

      reset(init) {
        this.x = Math.random() * W
        this.y = init ? Math.random() * H : H + 10
        this.size = Math.random() * 2 + 0.3
        this.speedY = -(Math.random() * 0.4 + 0.1)
        this.speedX = (Math.random() - 0.5) * 0.2
        this.opacity = Math.random() * 0.5 + 0.1
        this.life = 0
        this.maxLife = Math.random() * 600 + 200
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.life += 1
        if (this.life > this.maxLife || this.y < -10) this.reset(false)
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.opacity * (1 - this.life / this.maxLife)
        ctx.fillStyle = '#9D5CFF'
        ctx.shadowBlur = this.size * 3
        ctx.shadowColor = 'rgba(157,92,255,0.6)'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    for (let i = 0; i < 80; i += 1) {
      particles.push(new Particle())
    }

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(157,92,255,0.05)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 80) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y < H; y += 80) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
    }

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      drawGrid()
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      rafId = requestAnimationFrame(loop)
    }

    const handleMouseMove = (e) => {
      const card = profile3dRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rx = ((e.clientY - cy) / rect.height) * 20
      const ry = (-(e.clientX - cx) / rect.width) * 20
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`
    }

    const handleMouseLeave = () => {
      const card = profile3dRef.current
      if (!card) return
      card.style.transform = 'rotateY(0deg) rotateX(0deg)'
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const enable3D = import.meta.env.VITE_ENABLE_3D_BACKGROUND === 'true'

  // determine quality by screen width
  const [quality, setQuality] = useState('high')
  useEffect(() => {
    const w = window.innerWidth
    if (w < 640) setQuality('low')
    else if (w < 1024) setQuality('medium')
    else setQuality('high')
  }, [])

  const BackgroundScene = lazy(() => import('../three/BackgroundScene'))

  return (
    <section id="hero" className="relative min-h-screen pt-20 overflow-hidden">

      {!enable3D && <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10" />}
      {enable3D && (
        <Suspense fallback={null}>
          <BackgroundScene quality={quality} />
        </Suspense>
      )}
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
                onClick={() => setShowreelModalOpen(true)}
                className="px-8 py-4 bg-gradient-purple rounded-lg text-text font-bold flex items-center justify-center gap-2 hover:shadow-glow-purple-lg transition-all"
              >
                Watch Showreel
                <FiPlay className="text-xl" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, borderColor: '#9D5CFF' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 border-2 border-primary rounded-lg text-text font-bold hover:bg-primary/10 transition-all"
              >
                Hire Me
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

          <motion.div variants={fadeInUp} className="relative mx-auto w-full max-w-xl flex justify-center perspective-[1000px]">
            <div ref={profile3dRef} className="relative transition-transform duration-200 ease-out preserve-3d">
              {/* Soft purple glow */}
              <div className="absolute inset-0 scale-110 rounded-full bg-primary/40 blur-[80px]" />
              
              {/* Subtle floating animation on the image itself */}
              <motion.img 
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                src="/assets/logos/icon-editz.jpg" 
                alt="Icon Editz Logo" 
                className="relative z-10 w-64 md:w-80 lg:w-96 rounded-full shadow-[0_0_80px_rgba(157,92,255,0.4)] border-4 border-primary/20 object-cover aspect-square"
              />
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

      {/* Showreel Modal */}
      <AnimatePresence>
        {showreelModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_120px_rgba(157,92,255,0.2)]"
            >
              <button 
                onClick={() => setShowreelModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-primary transition-colors group"
                aria-label="Close Showreel"
              >
                <FiX className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <video 
                src="/videos/3d-lyrics-video-1.mp4" 
                className="w-full h-full object-cover"
                controls 
                autoPlay 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

