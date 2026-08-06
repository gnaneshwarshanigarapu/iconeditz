import React, { memo } from 'react'
import { motion } from 'framer-motion'
import SectionShell from './SectionShell'

const TestimonialsSection = memo(function TestimonialsSection({ visibleTestimonials }) {
  if (!visibleTestimonials || visibleTestimonials.length === 0) return null

  return (
    <SectionShell
      id="testimonials"
      eyebrow="Testimonials"
      title="Trusted by creators and clients who value quality"
      description="A calm, elegant proof section that stays lightweight and quick to browse."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {visibleTestimonials.map((item, index) => (
          <motion.div
            key={item.id || item.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="rounded-[1.6rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
          >
            <div className="mb-4 flex gap-1 text-primary">
              {Array.from({ length: item.rating || 5 }).map((_, starIndex) => (
                <span key={starIndex}>★</span>
              ))}
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
  )
})

export default TestimonialsSection
