import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import SectionShell from './SectionShell'

const ToolsSection = memo(function ToolsSection({ visibleTools }) {
  if (!visibleTools || visibleTools.length === 0) return null

  return (
    <SectionShell
      id="tools"
      eyebrow="Tools & Software"
      title="The software stack behind polished work"
      description="A refined toolkit for editing, motion design, and polished social-first delivery."
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {visibleTools.map((tool, index) => (
          <motion.div
            key={tool.id || tool.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="rounded-[1.6rem] border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
          >
            <div className="inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">{tool.name}</h3>
            <p className="mt-3 text-sm leading-8 text-text-muted">{tool.description}</p>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-text-muted">
                <span>Proficiency</span>
                <span className="font-semibold text-primary">{tool.percentage || 95}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                  style={{ width: `${tool.percentage || 95}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
})

export default ToolsSection
