import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import SectionShell from './SectionShell'

const cardMotion = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const FeaturedServicesSection = memo(function FeaturedServicesSection({ servicesPage, featuredServices }) {
  if (!featuredServices || featuredServices.length === 0) return null

  return (
    <SectionShell
      id="services"
      eyebrow={servicesPage.homeServices?.label || 'Featured Services'}
      title={servicesPage.homeServices?.heading || 'Creative support for every big idea'}
      description={servicesPage.homeServices?.description}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featuredServices.map((service, index) => (
          <motion.div
            key={service.id || service.title}
            variants={cardMotion}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="rounded-[1.6rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/30"
          >
            <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">{service.title}</h3>
            <p className="mt-3 text-sm leading-8 text-text-muted">{service.description}</p>
          </motion.div>
        ))}
      </div>
      {servicesPage.homeServices?.buttonVisible !== false && (
        <div className="mt-10 flex justify-center">
          <Link
            to={servicesPage.homeServices?.buttonUrl || '/services'}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/50 bg-gradient-to-r from-primary/20 via-white/5 to-primary-light/20 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(157,92,255,.22)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_0_34px_rgba(157,92,255,.45)]"
          >
            {servicesPage.homeServices?.buttonText || 'View All Services'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </SectionShell>
  )
})

export default FeaturedServicesSection
