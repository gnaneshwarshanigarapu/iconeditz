import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Sparkles, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../hooks/useSiteContent'
import { useReducedMotion } from '../hooks/useReducedMotion'
import ImageWithFallback from './ui/ImageWithFallback'
import VideoWithPlaceholder from './ui/VideoWithPlaceholder'
import CmsCta from './CmsCta'

const sectionMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const cardMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

function SectionShell({ eyebrow, title, description, children, id }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionMotion}
      transition={{ duration: 0.55 }}
      className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mb-10 max-w-2xl">
        <p className="text-sm uppercase tracking-[0.36em] text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
        {description ? <p className="mt-4 text-base leading-8 text-text-muted">{description}</p> : null}
      </div>
      {children}
    </motion.section>
  )
}

export default function PremiumHomepage() {
  const { content } = useSiteContent()
  const [activeFaq, setActiveFaq] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  const heroBadges = content.hero.badges || []
  const servicesPage = content.servicesPage || {}
  const featuredServices = (servicesPage.services || []).filter((service) => service.visible && service.status !== 'draft' && service.featured).slice(0, 4)
  const visibleProjects = (content.projects.items || []).filter((item) => item.visible).slice(0, 3)
  const visibleTools = (content.tools.items || []).filter((item) => item.visible)
  const visibleTestimonials = (content.testimonials.items || []).filter((item) => item.visible)
  const visibleFaq = (content.faq.items || []).filter((item) => item.visible)

  return (
    <div className="relative bg-transparent">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(157,92,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(179,136,255,0.2),transparent_35%)]" />
          <section id="hero" className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-24 pt-[132px] lg:px-8 lg:pb-28">
        <div className="absolute inset-0 -z-10 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white/5 via-black/20 to-primary/10" />
        <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div initial={prefersReducedMotion ? false : { opacity: 0, x: -18 }} animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }} transition={{ duration: 0.24 }} className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.36em] text-primary">Premium creative studio</p>
            <h1 className="text-gradient mt-5 text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-7xl">{content.hero.heading}</h1>
            <p className="mt-5 text-base font-medium text-primary sm:text-lg">{content.hero.subtitle}</p>
            <p className="mt-6 max-w-xl text-base leading-8 text-text-muted sm:text-lg">{content.hero.description}</p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link to="/projects" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.38)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(168,85,247,0.62)]">
                Explore Projects <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/hire" className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-[#150B25]/70 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:border-violet-400/60 hover:bg-violet-500/15">
                Hire Me
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-muted">{badge}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={prefersReducedMotion ? false : { opacity: 0, x: 18 }} animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="relative mx-auto flex w-full justify-center">
            <motion.div animate={prefersReducedMotion ? { y: 0 } : { y: [-10, 10, -10] }} transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }} whileHover={{ scale: 1.03 }} className="relative flex h-[min(420px,calc(100vw-3rem))] w-[min(420px,calc(100vw-3rem))] items-center justify-center rounded-3xl border border-violet-500/20 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,.32)] backdrop-blur-xl">
              <div aria-hidden="true" className="absolute inset-10 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.38),transparent_68%)] blur-2xl" />
              <img src="/assets/logos/icon-editz.jpg" alt="ICON EDITZ" className="relative h-[min(260px,62vw)] w-[min(260px,62vw)] object-contain" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <SectionShell id="showreel" eyebrow="Showreel" title="A cinematic preview of the full experience" description="A focused preview that opens into a richer story when you choose to explore more.">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <motion.div variants={cardMotion} transition={{ duration: 0.5 }} className="overflow-hidden rounded-[2rem] border border-primary/20 bg-[#0d0718]/80 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
            <div className="relative aspect-video bg-black">
              <VideoWithPlaceholder src={content.showreel.videoUrl} poster={content.showreel.thumbnail} title={content.showreel.title} className="h-full w-full" />
            </div>
          </motion.div>
          <motion.div variants={cardMotion} transition={{ duration: 0.6 }} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 p-3 text-primary"><Play className="h-5 w-5" /></div>
            <h3 className="mt-6 text-2xl font-semibold text-white">{content.showreel.title}</h3>
            <p className="mt-4 text-base leading-8 text-text-muted">{content.showreel.description}</p>
            <a href="/projects" className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20">{content.showreel.buttonText} <ArrowRight className="h-4 w-4" /></a>
          </motion.div>
        </div>
      </SectionShell>

      {featuredServices.length > 0 && <SectionShell id="services" eyebrow={servicesPage.homeServices?.label || 'Featured Services'} title={servicesPage.homeServices?.heading || 'Creative support for every big idea'} description={servicesPage.homeServices?.description}>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredServices.map((service, index) => {
            const Icon = iconRegistry[service.icon] || Sparkles
            return <motion.div key={service.id} variants={cardMotion} transition={{ delay: index * 0.06 }} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/30"><div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-semibold text-white">{service.title}</h3><p className="mt-3 text-sm leading-8 text-text-muted">{service.description}</p></motion.div>
          })}
        </div>
        {servicesPage.homeServices?.buttonVisible !== false && <div className="mt-10 flex justify-center"><Link to={servicesPage.homeServices?.buttonUrl || '/services'} className="group inline-flex items-center gap-2 rounded-full border border-primary/50 bg-gradient-to-r from-primary/20 via-white/5 to-primary-light/20 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(157,92,255,.22)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_0_34px_rgba(157,92,255,.45)]">{servicesPage.homeServices?.buttonText || 'View All Services'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></div>}
      </SectionShell>}

      <SectionShell id="projects" eyebrow="Featured Projects" title="Three standout collaborations that reflect the studio’s best work" description="The homepage highlights only the strongest work so the story stays focused and premium.">
        <div className="grid gap-6 lg:grid-cols-3">
          {visibleProjects.map((project, index) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="relative aspect-video overflow-hidden bg-black">
                <ImageWithFallback src={project.thumbnail || '/assets/images/og-icon-editz.png'} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <div className="rounded-full bg-primary/90 p-4 text-white"><Play className="h-6 w-6" /></div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">{project.category}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{project.title}</h3>
                <p className="mt-3 text-sm leading-8 text-text-muted">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="tools" eyebrow="Tools & Software" title="The software stack behind polished work" description="A refined toolkit for editing, motion design, and polished social-first delivery.">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {visibleTools.map((tool, index) => {
            const Icon = iconRegistry[tool.icon] || Sparkles
            return (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
                <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-5 text-xl font-semibold text-white">{tool.name}</h3>
                <p className="mt-3 text-sm leading-8 text-text-muted">{tool.description}</p>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
                    <span>Proficiency</span>
                    <span className="font-semibold text-primary">{tool.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light" style={{ width: `${tool.percentage}%` }} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell id="testimonials" eyebrow="Testimonials" title="Trusted by creators and clients who value quality" description="A calm, elegant proof section that stays lightweight and quick to browse.">
        <div className="grid gap-6 lg:grid-cols-3">
          {visibleTestimonials.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
              <div className="mb-4 flex gap-1 text-primary">
                {Array.from({ length: item.rating || 5 }).map((_, starIndex) => <span key={starIndex}>★</span>)}
              </div>
              <p className="text-base leading-8 text-text-muted">“{item.review}”</p>
              <div className="mt-6">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-sm text-text-muted">{item.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="faq" eyebrow="FAQ" title="Answers to the questions most clients ask" description="A simple accordion layout that keeps the page focused and easy to scan.">
        <div className="mx-auto max-w-3xl space-y-3">
          {visibleFaq.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/5 backdrop-blur-xl">
              <button type="button" onClick={() => setActiveFaq(activeFaq === index ? -1 : index)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                <span className="font-semibold text-white">{item.question}</span>
                <ChevronDown className={`h-5 w-5 text-primary transition ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeFaq === index ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-6 pb-5">
                    <p className="text-sm leading-8 text-text-muted">{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      <CmsCta />
    </div>
  )
}

const iconRegistry = {
  Sparkles,
  Zap: Sparkles,
  BadgeCheck: Sparkles,
  Palette: Sparkles,
  Share2: Sparkles,
  Clapperboard: Sparkles,
  Film: Sparkles,
  Image: Sparkles,
  PenTool: Sparkles,
}
