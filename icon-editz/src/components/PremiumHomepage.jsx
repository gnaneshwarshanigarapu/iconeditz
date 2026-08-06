import React, { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../hooks/useSiteContent'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Lazy Load Heavy Below-The-Fold Components
const ShowreelSection = lazy(() => import('./home/ShowreelSection'))
const FeaturedServicesSection = lazy(() => import('./home/FeaturedServicesSection'))
const FeaturedProjectsSection = lazy(() => import('./home/FeaturedProjectsSection'))
const ToolsSection = lazy(() => import('./home/ToolsSection'))
const TestimonialsSection = lazy(() => import('./home/TestimonialsSection'))
const FaqSection = lazy(() => import('./home/FaqSection'))
const CmsCta = lazy(() => import('./CmsCta'))

function SectionSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-32 w-full animate-pulse rounded-3xl bg-white/5 border border-white/10" />
    </div>
  )
}

export default function PremiumHomepage() {
  const { content } = useSiteContent()
  const prefersReducedMotion = useReducedMotion()

  const heroBadges = content.hero.badges || []
  const servicesPage = content.servicesPage || {}
  const featuredServices = (servicesPage.services || [])
    .filter((service) => service.visible && service.status !== 'draft' && service.featured)
    .slice(0, 4)
  const visibleProjects = (content.projects.items || []).filter((item) => item.visible).slice(0, 3)
  const visibleTools = (content.tools.items || []).filter((item) => item.visible)
  const visibleTestimonials = (content.testimonials.items || []).filter((item) => item.visible)
  const visibleFaq = (content.faq.items || []).filter((item) => item.visible)

  return (
    <div className="relative bg-transparent">
      {/* Dynamic Background Mesh */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(157,92,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(179,136,255,0.2),transparent_35%)]" />

      {/* INSTANT RENDER HERO SECTION */}
      <section
        id="hero"
        className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center px-6 pb-20 pt-[120px] lg:px-8 lg:pb-24"
      >
        <div className="absolute inset-0 -z-10 rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white/5 via-black/20 to-primary/10" />
        <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl"
          >
            <p className="text-sm uppercase tracking-[0.36em] text-primary">Premium creative studio</p>
            <h1 className="text-gradient mt-5 text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-7xl">
              {content.hero.heading}
            </h1>
            <p className="mt-5 text-base font-medium text-primary sm:text-lg">{content.hero.subtitle}</p>
            <p className="mt-6 max-w-xl text-base leading-8 text-text-muted sm:text-lg">
              {content.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.38)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(168,85,247,0.62)]"
              >
                Explore Projects <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/hire"
                className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-[#150B25]/70 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:border-violet-400/60 hover:bg-violet-500/15"
              >
                Hire Me
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-muted">
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative mx-auto flex w-full justify-center"
          >
            <div className="relative flex h-[min(420px,calc(100vw-3rem))] w-[min(420px,calc(100vw-3rem))] items-center justify-center rounded-3xl border border-violet-500/20 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,.32)] backdrop-blur-xl">
              <div aria-hidden="true" className="absolute inset-10 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,.38),transparent_68%)] blur-2xl" />
              <img
                src="/assets/logos/icon-editz.jpg"
                alt="ICON EDITZ"
                decoding="async"
                fetchpriority="high"
                className="relative h-[min(260px,62vw)] w-[min(260px,62vw)] object-contain"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* LAZY LOADED BELOW-THE-FOLD SECTIONS WITH SUSPENSE */}
      <Suspense fallback={<SectionSkeleton />}>
        <ShowreelSection showreel={content.showreel} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedServicesSection servicesPage={servicesPage} featuredServices={featuredServices} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedProjectsSection visibleProjects={visibleProjects} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <ToolsSection visibleTools={visibleTools} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsSection visibleTestimonials={visibleTestimonials} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FaqSection visibleFaq={visibleFaq} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <CmsCta />
      </Suspense>
    </div>
  )
}
