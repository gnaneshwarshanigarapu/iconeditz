import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '../utils/animations'
import { validateEmail } from '../utils/helpers'
import { FiMail, FiPhone } from 'react-icons/fi'
import { FaInstagram, FaYoutube } from 'react-icons/fa'
import { AiOutlineMail } from 'react-icons/ai'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required'
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Future: Integrate with EmailJS or backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })

    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section id="contact" className="relative py-20 md:py-32">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Title */}
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Let's Work Together</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-purple mt-4 rounded-full mx-auto" />
            <p className="text-text-muted mt-6 max-w-2xl mx-auto">
              Have a project in mind? Let's discuss how I can help bring your creative vision to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-8">Get in Touch</h3>
                <p className="text-text-muted mb-8">
                  Feel free to reach out through any of these channels. I'm always excited to discuss new projects and collaborations.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {/* Email */}
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 p-4 rounded-lg glass-effect hover:border-primary/50 transition-all"
                >
                  <div className="text-primary text-2xl mt-1">
                    <FiMail />
                  </div>
                  <div>
                    <p className="text-text font-semibold">Email</p>
                    <a
                      href="mailto:shanigarapugnaneshwar@gmail.com"
                      className="text-text-muted hover:text-primary transition-colors"
                    >
                      shanigarapugnaneshwar@gmail.com
                    </a>
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 p-4 rounded-lg glass-effect hover:border-primary/50 transition-all"
                >
                  <div className="text-primary text-2xl mt-1">
                    <FiPhone />
                  </div>
                  <div>
                    <p className="text-text font-semibold">Phone</p>
                    <a
                      href="tel:+919346084649"
                      className="text-text-muted hover:text-primary transition-colors"
                    >
                      +91 93460 84649
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Social Links */}
              <div>
                <p className="text-text font-semibold mb-4">Follow Me</p>
                <div className="flex gap-4">
                  {[
                    { icon: FaInstagram, url: 'https://www.instagram.com/icon._editz/', label: 'Instagram' },
                    { icon: FaYoutube, url: 'https://www.youtube.com/@iconeditz143', label: 'YouTube' },
                    { icon: AiOutlineMail, url: 'mailto:shanigarapugnaneshwar@gmail.com', label: 'Email' },
                  ].map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, color: '#9D5CFF' }}
                      className="text-2xl text-text-muted hover:text-primary transition-colors"
                    >
                      <social.icon />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={fadeInUp}>
              <form
                onSubmit={handleSubmit}
                className="glass-effect p-8 rounded-xl space-y-6"
              >
                {/* Success Message */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/20 border border-primary rounded-lg text-primary text-center"
                  >
                    Thank you for your message! I'll get back to you soon.
                  </motion.div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-text font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-surface rounded-lg border ${
                      errors.name
                        ? 'border-primary-light'
                        : 'border-primary/20 focus:border-primary'
                    } text-text placeholder-text-muted focus:outline-none transition-all`}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-primary-light text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-text font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-surface rounded-lg border ${
                      errors.email
                        ? 'border-primary-light'
                        : 'border-primary/20 focus:border-primary'
                    } text-text placeholder-text-muted focus:outline-none transition-all`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-primary-light text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-text font-semibold mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-surface rounded-lg border ${
                      errors.subject
                        ? 'border-primary-light'
                        : 'border-primary/20 focus:border-primary'
                    } text-text placeholder-text-muted focus:outline-none transition-all`}
                    placeholder="Project subject"
                  />
                  {errors.subject && (
                    <p className="text-primary-light text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-text font-semibold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-4 py-3 bg-surface rounded-lg border ${
                      errors.message
                        ? 'border-primary-light'
                        : 'border-primary/20 focus:border-primary'
                    } text-text placeholder-text-muted focus:outline-none transition-all resize-none`}
                    placeholder="Tell me about your project..."
                  />
                  {errors.message && (
                    <p className="text-primary-light text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-purple rounded-lg text-text font-bold hover:shadow-glow-purple-lg transition-all"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
