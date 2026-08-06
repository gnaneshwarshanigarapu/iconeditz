import React, { memo } from 'react'
import { motion } from 'framer-motion'

const sectionMotion = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const SectionShell = memo(function SectionShell({ eyebrow, title, description, children, id }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={sectionMotion}
      transition={{ duration: 0.4 }}
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
})

export default SectionShell
