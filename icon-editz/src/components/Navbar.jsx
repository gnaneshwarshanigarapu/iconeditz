import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './common/Logo'
import NavItem from './NavItem'
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
    { label: 'Store', id: 'store', path: '/store' },
    { label: 'Contact', id: 'contact', path: '/contact' },
  ]

  useEffect(() => {
    if (location.pathname === '/') {
      const handleScroll = () => {
        const currentSection = getActiveSection(navItems.map(i => i.id).filter(Boolean));
        if (currentSection) setActiveSection(currentSection);
      }
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      const activeItem = navItems.find(item => item.path !== '/' && location.pathname.startsWith(item.path));
      setActiveSection(activeItem ? activeItem.id || activeItem.label.toLowerCase() : '');
    }
  }, [location.pathname]);

  const handleNavClick = (item) => {
    setIsOpen(false);
    if (item.path && location.pathname !== item.path) {
        if (item.path.startsWith('/')) {
            navigate(item.path);
        }
    }
    if (item.id) {
        if (location.pathname !== '/') {
            navigate(`/?scrollTo=${item.id}`);
        } else {
            scrollToSection(item.id);
        }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-[20px] z-[1000] w-[calc(100%-40px)] max-w-[1400px] h-[78px] mx-auto rounded-full bg-[rgba(12,10,20,0.88)] backdrop-blur-[20px] border border-[rgba(168,85,247,0.18)] shadow-navbar-shadow"
      >
        <div className="h-full flex items-center justify-between px-6">
          <Logo size="w-12 h-12" />

          <div className="hidden lg:flex items-center gap-x-12">
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                isActive={activeSection === item.id}
                onClick={handleNavClick}
              />
            ))}
          </div>

          <div className="hidden lg:flex">
            <button
              onClick={() => handleNavClick({ path: '/contact' })}
              className="rounded-full px-[34px] py-[16px] text-white font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] shadow-hire-me-glow transition-transform duration-250 hover:scale-103"
            >
              Hire Me
            </button>
          </div>

          <div className="lg:hidden">
            <button onClick={() => setIsOpen(true)} className="p-2 text-white">
              <FiMenu size={28} />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[1100] bg-[rgba(12,10,20,0.95)] backdrop-blur-[15px] lg:hidden"
          >
            <div className="flex justify-end p-6">
                <button onClick={() => setIsOpen(false)} className="p-2 text-white">
                    <FiX size={32} />
                </button>
            </div>
            <div className="flex flex-col items-center justify-center h-full -mt-16 gap-y-8">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`text-4xl font-bold ${activeSection === item.id ? 'text-primary' : 'text-white'}`}
                >
                  {item.label}
                </motion.button>
              ))}
               <button
                onClick={() => handleNavClick({ path: '/contact' })}
                className="mt-8 rounded-full px-[34px] py-[16px] text-white font-bold text-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] shadow-hire-me-glow"
              >
                Hire Me
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
