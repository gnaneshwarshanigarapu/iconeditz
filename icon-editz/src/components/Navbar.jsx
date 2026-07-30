import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './common/Logo';
import { scrollToSection, getActiveSection } from '../utils/helpers'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { label: 'Home', id: 'hero', path: '/' },
    { label: 'About', id: 'about', path: '/about' },
    { label: 'Services', id: 'services', path: '/services' },
    { label: 'Projects', id: 'projects', path: '/projects' },
    { label: 'Store', path: '/store' },
    { label: 'Contact', id: 'contact', path: '/contact' },
  ]

  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        const currentSection = getActiveSection();
        if (currentSection) {
          setActiveSection(currentSection);
        }
      }
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      const searchParams = new URLSearchParams(location.search);
      const scrollTo = searchParams.get('scrollTo');
      if (scrollTo) {
        setTimeout(() => scrollToSection(scrollTo), 100);
        navigate('/', { replace: true });
      }
      
      // Initial check
      handleScroll();

      return () => window.removeEventListener('scroll', handleScroll)
    } else {
      const currentPath = location.pathname.substring(1);
      const activeItem = navItems.find(item => location.pathname.startsWith(item.path) && item.path !== '/');
      setActiveSection(activeItem ? activeItem.id || activeItem.label.toLowerCase() : '');
    }
  }, [location, navigate, navItems])

  const handleNavClick = (item) => {
    if (item.path && item.path !== '/' && item.path.startsWith('/')) {
      navigate(item.path)
    } else if (location.pathname !== '/') {
      navigate(`/?scrollTo=${item.id}`)
    } else {
      scrollToSection(item.id)
    }
    setIsOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px] flex justify-center px-4 md:px-6">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-7xl h-full rounded-full bg-black/50 backdrop-blur-lg border border-white/10 shadow-glow-navbar transition-shadow duration-300"
      >
        <div className="h-full flex items-center justify-between px-6">
          {/* Left: Logo & Brand Name */}
          <Logo size="w-12 h-12" />

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center h-full gap-x-2">
            {navItems.map((item) => {
              const isActive = item.id ? activeSection === item.id : location.pathname.startsWith(item.path);
              return (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`relative h-full flex items-center px-4 text-sm font-medium transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary ${
                    isActive
                      ? 'text-white'
                      : 'text-text-muted hover:text-white'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-item"
                      className="absolute inset-0 rounded-full bg-primary/15 border-2 border-[#A855F7]"
                      style={{ borderRadius: 9999 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Right: Hire Me Button & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="hidden md:block rounded-full bg-gradient-purple px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 transform hover:scale-103 hover:shadow-glow-purple-lg whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary"
            >
              Hire Me
            </button>

            <button
              className="lg:hidden rounded-full p-2.5 text-2xl text-text transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-[84px] w-[calc(100%-2rem)] max-w-7xl rounded-2xl bg-black/70 backdrop-blur-xl border border-primary/20 shadow-glow-purple overflow-hidden lg:hidden"
          >
            <div className="p-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = item.id ? activeSection === item.id : location.pathname.startsWith(item.path);
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className={`relative w-full text-left text-base font-medium transition-colors p-3 rounded-lg ${
                      isActive
                        ? 'text-white bg-primary/15'
                        : 'text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
                  </motion.button>
                )
              })}
              <button
                onClick={() => {
                  navigate('/contact')
                  setIsOpen(false)
                }}
                className="w-full rounded-lg bg-gradient-purple px-4 py-3.5 text-center text-white font-bold mt-2 shadow-glow-purple"
              >
                Hire Me
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
