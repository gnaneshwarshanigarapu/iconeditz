import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './common/Logo'
import NavItem from './NavItem'
import { scrollToSection } from '../utils/helpers'

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
        const sectionElements = navItems.map(item => item.id && document.getElementById(item.id)).filter(Boolean);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                // This creates a "line" at 40% from the top of the viewport.
                // When a section's top crosses this line, it becomes active.
                rootMargin: '-40% 0px -60% 0px',
            }
        );

        sectionElements.forEach(element => {
            if (element) observer.observe(element);
        });

        return () => {
            sectionElements.forEach(element => {
                if (element) observer.unobserve(element);
            });
        };
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
            window.scrollTo(0, 0);
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
        className="sticky top-[16px] z-[1000] w-[calc(100%-40px)] max-w-[1400px] h-[64px] mx-auto rounded-full bg-[rgba(12,10,20,0.88)] backdrop-blur-[20px] border border-[rgba(168,85,247,0.18)] shadow-navbar-shadow"
      >
        <div className="h-full flex items-center justify-between px-4">
          <Logo size="w-10 h-10" />

          <div className="hidden lg:flex items-center gap-x-8">
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
              className="rounded-full px-8 py-2.5 h-[44px] flex items-center justify-center text-white font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] shadow-hire-me-glow transition-transform duration-250 hover:scale-103"
            >
              Hire Me
            </button>
          </div>

          <div className="lg:hidden">
            <button onClick={() => setIsOpen(true)} className="p-2 text-white">
              <FiMenu size={24} />
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
                    <FiX size={28} />
                </button>
            </div>
            <div className="flex flex-col items-center justify-center h-full -mt-16 gap-y-6">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`text-3xl font-bold ${activeSection === item.id ? 'text-primary' : 'text-white'}`}
                >
                  {item.label}
                </motion.button>
              ))}
               <button
                onClick={() => handleNavClick({ path: '/contact' })}
                className="mt-6 rounded-full px-8 py-3 text-white font-bold text-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] shadow-hire-me-glow"
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
