import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { scrollToSection, getActiveSection } from '../utils/helpers'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Home', id: 'hero', path: '/' },
    { label: 'Store', path: '/store' },
    { label: 'About', id: 'about', path: '/' },
    { label: 'Projects', id: 'projects', path: '/' },
    { label: 'Tools', id: 'tools', path: '/' },
    { label: 'Contact', id: 'contact', path: '/' },
  ]

  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        setActiveSection(getActiveSection())
      }
      window.addEventListener('scroll', handleScroll)
      // Check if we need to scroll from navigation
      const searchParams = new URLSearchParams(location.search);
      const scrollTo = searchParams.get('scrollTo');
      if (scrollTo) {
        setTimeout(() => scrollToSection(scrollTo), 100);
        // Clean up URL
        navigate('/', { replace: true });
      }
      return () => window.removeEventListener('scroll', handleScroll)
    } else {
      setActiveSection('')
    }
  }, [location, navigate])

  const handleNavClick = (item) => {
    if (item.path && item.path !== '/' && !item.id) {
      navigate(item.path)
    } else if (location.pathname !== '/') {
      navigate(`/?scrollTo=${item.id}`)
    } else {
      scrollToSection(item.id)
    }
    setIsOpen(false)
  }

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center px-4 md:px-6 pointer-events-none">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl rounded-full bg-black/50 backdrop-blur-md border border-primary/20 shadow-[0_0_15px_rgba(157,92,255,0.2)] hover:shadow-glow-purple transition-shadow duration-300 pointer-events-auto"
      >
        <div className="px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Left: Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
              <img 
                src="/assets/logos/icon-editz.jpg" 
                alt="Icon Editz Logo" 
                className="relative w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-primary/40 group-hover:border-primary transition-colors duration-300"
              />
            </div>
            <span className="font-bold text-lg md:text-xl lg:text-2xl text-text hidden sm:block tracking-wide group-hover:text-primary transition-colors duration-300">
              Icon Editz
            </span>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              const isActive = (location.pathname === '/' && activeSection === item.id) || (location.pathname.startsWith('/store') && item.label === 'Store');
              return (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`relative text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                  whileHover={{ color: isActive ? '#9D5CFF' : '#ffffff' }}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[6px] left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(157,92,255,0.8)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Right: Hire Me Button & Mobile Toggle */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => handleNavClick({ id: 'contact', path: '/' })}
              className="hidden md:block rounded-full bg-gradient-purple hover:bg-primary px-6 py-2.5 text-sm font-bold text-white transition-all shadow-glow-purple hover:shadow-glow-purple-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Hire Me
            </button>

            <button
              className="lg:hidden text-text text-2xl p-2.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-6xl mt-3 rounded-3xl bg-black/80 backdrop-blur-xl border border-primary/20 shadow-glow-purple overflow-hidden pointer-events-auto lg:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = (location.pathname === '/' && activeSection === item.id) || (location.pathname.startsWith('/store') && item.label === 'Store');
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className={`text-left text-base font-medium transition-colors py-2 border-b border-white/5 ${isActive ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                    whileHover={{ x: 5 }}
                  >
                    {item.label}
                  </motion.button>
                )
              })}
              <button
                onClick={() => handleNavClick({ id: 'contact', path: '/' })}
                className="w-full rounded-full bg-gradient-purple px-4 py-3.5 text-center text-white font-bold mt-2 shadow-glow-purple md:hidden"
              >
                Hire Me
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
