import React from 'react'
import { motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'
import { fadeInUp, staggerContainer } from '../utils/animations'

const testimonials = [
  {
    name: 'Sai Kumar',
    role: 'Music Creator',
    quote: 'The lyric video matched the beat perfectly and looked premium on YouTube. Delivery was quick and clean.',
  },
  {
    name: 'Harika & Arun',
    role: 'Wedding Client',
    quote: 'Our pre-wedding edit felt cinematic without losing the real emotions. The pacing and color were beautiful.',
  },
  {
    name: 'Rohit Edits',
    role: 'Reels Creator',
    quote: 'The fast beat status edits are sharp, trendy, and ready to post. Great attention to timing.',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20 md:py-32">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Testimonials</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <motion.figure key={item.name} variants={fadeInUp} className="glass-effect rounded-xl p-6">
                <div className="mb-5 flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar key={index} className="fill-current" />
                  ))}
                </div>
                <blockquote className="text-text-muted leading-relaxed mb-6">"{item.quote}"</blockquote>
                <figcaption>
                  <p className="font-semibold text-text">{item.name}</p>
                  <p className="text-sm text-text-muted">{item.role}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
