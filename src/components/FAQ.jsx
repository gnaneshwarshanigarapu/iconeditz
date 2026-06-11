import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import { fadeInUp, staggerContainer } from '../utils/animations'

const faqs = [
  {
    question: 'How do I send footage for editing?',
    answer: 'Share your clips through Google Drive, Dropbox, or any downloadable link with notes about music, style, text, and export format.',
  },
  {
    question: 'Can you edit reels and full videos?',
    answer: 'Yes. Short-form reels, WhatsApp status videos, birthday edits, wedding highlights, lyric videos, and YouTube-ready edits are supported.',
  },
  {
    question: 'How fast is delivery?',
    answer: 'Small reels can usually be delivered quickly, while wedding films and 3D lyric videos need more time depending on length and complexity.',
  },
  {
    question: 'Do store products update instantly?',
    answer: 'Yes. Products created, edited, published, or unpublished in admin are saved locally and reflected in the store immediately.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="relative py-20 md:py-32">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">FAQ</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full" />
          </motion.div>

          <motion.div variants={fadeInUp} className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div key={faq.question} className="glass-effect rounded-xl border border-primary/10">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                  >
                    <span>{faq.question}</span>
                    <FiChevronDown className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  {isOpen && <p className="px-5 pb-5 text-text-muted leading-relaxed">{faq.answer}</p>}
                </div>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
