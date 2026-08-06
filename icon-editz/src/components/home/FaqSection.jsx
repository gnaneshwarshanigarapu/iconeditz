import React, { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import SectionShell from './SectionShell'

const FaqSection = memo(function FaqSection({ visibleFaq }) {
  const [activeFaq, setActiveFaq] = useState(0)

  if (!visibleFaq || visibleFaq.length === 0) return null

  return (
    <SectionShell
      id="faq"
      eyebrow="FAQ"
      title="Answers to the questions most clients ask"
      description="A simple accordion layout that keeps the page focused and easy to scan."
    >
      <div className="mx-auto max-w-3xl space-y-3">
        {visibleFaq.map((item, index) => (
          <motion.div
            key={item.id || item.question}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <span className="font-semibold text-white">{item.question}</span>
              <ChevronDown className={`h-5 w-5 text-primary transition ${activeFaq === index ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeFaq === index ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden px-6 pb-5"
                >
                  <p className="text-sm leading-8 text-text-muted">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
})

export default FaqSection
