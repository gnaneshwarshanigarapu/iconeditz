import React from 'react'
import { motion } from 'framer-motion'
import { FaInstagram, FaYoutube } from 'react-icons/fa'
import { AiOutlineMail } from 'react-icons/ai'
import { fadeInUp } from '../utils/animations'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: FaInstagram, url: 'https://www.instagram.com/icon._editz/', label: 'Instagram' },
    { icon: FaYoutube, url: 'https://www.youtube.com/@iconeditz143', label: 'YouTube' },
    { icon: AiOutlineMail, url: 'mailto:shanigarapugnaneshwar@gmail.com', label: 'Email' },
  ]

  return (
    <motion.footer
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="border-t border-primary/10 bg-surface/50 backdrop-blur-sm py-12"
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div whileHover={{ scale: 1.03 }} className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-gradient mb-2">Icon Editz</h3>
            <p className="text-text-muted">
              Premium video editing and motion graphics by Nani.
            </p>
          </motion.div>

          <motion.div className="text-center">
            <h4 className="text-lg font-bold text-text mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[
                { label: 'About', id: 'about' },
                { label: 'Projects', id: 'projects' },
                { label: 'Tools', id: 'tools' },
                { label: 'Contact', id: 'contact' },
              ].map((link) => (
                <motion.a
                  key={link.id}
                  href={`#${link.id}`}
                  whileHover={{ color: '#9D5CFF' }}
                  className="block text-text-muted hover:text-primary transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div className="text-center md:text-right">
            <h4 className="text-lg font-bold text-text mb-4">Follow</h4>
            <div className="flex justify-center md:justify-end gap-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target={social.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel={social.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                  whileHover={{ scale: 1.2, color: '#9D5CFF' }}
                  className="text-2xl text-text-muted hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8" />

        <motion.div className="text-center text-text-muted text-sm">
          <p>
            Copyright {currentYear} Icon Editz. All rights reserved. Designed and built by Nani.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <a href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/sitemap.xml" className="hover:text-primary transition-colors">
              Sitemap
            </a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
