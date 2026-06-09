import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { scrollToSection, getActiveSection } from '../utils/helpers'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  const navItems = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'Projects', id: 'projects' },
    { label: 'Tools', id: 'tools' },
    { label: 'Contact', id: 'contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setActiveSection(getActiveSection())
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (id) => {
    scrollToSection(id)
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect backdrop-blur-lg border-b border-primary/10"
    >
      <div className="container-custom flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="font-bold text-2xl md:text-3xl text-gradient cursor-pointer"
        >
          Icon Editz
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="relative text-text-muted hover:text-text transition-colors"
              whileHover={{ color: '#9D5CFF' }}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-purple"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavClick('contact')}
          className="hidden md:block px-6 py-2 bg-gradient-purple rounded-lg text-text font-semibold hover:shadow-glow-purple-lg transition-all"
        >
          Get in Touch
        </motion.button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-text text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-surface/80 backdrop-blur-lg"
      >
        <div className="container-custom py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="text-left text-text-muted hover:text-primary transition-colors py-2"
              whileHover={{ x: 10 }}
            >
              {item.label}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavClick('contact')}
            className="w-full px-4 py-2 bg-gradient-purple rounded-lg text-text font-semibold mt-2"
          >
            Get in Touch
          </motion.button>
        </div>
      </motion.div>
    </motion.nav>
  )
}
