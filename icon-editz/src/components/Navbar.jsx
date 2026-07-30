import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import NavItem from './NavItem';
import { scrollToSection } from '../utils/helpers';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Reduced the navItems to match the requested items
  const navItems = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Projects', id: 'projects' },
    { label: 'Store', id: 'store' },
    { label: 'Contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // A small threshold
    };

    window.addEventListener('scroll', handleScroll);
    
    const sectionIds = navItems.map(item => item.id);
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let currentSectionId = entry.target.id;
            // As per requirement, 'About' section also activates 'Home' nav item
            if (currentSectionId === 'about') {
              setActiveSection('hero');
            } else {
              setActiveSection(currentSectionId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger when the middle of the section crosses the middle of the viewport
        threshold: 0,
      }
    );

    sections.forEach(section => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sections.forEach(section => observer.unobserve(section));
    };
  }, []); // Empty dependency array to run only once on mount

  const handleNavClick = (item) => {
    setIsOpen(false);
    if (item.id) {
      scrollToSection(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className={`fixed top-5 z-50 left-1/2 -translate-x-1/2 w-[92%] max-w-[1450px] h-[72px]
                   rounded-full border 
                   transition-all duration-300
                   ${scrolled 
                     ? 'bg-[rgba(18,12,28,.95)] border-[rgba(147,51,234,.35)] shadow-[0_15px_50px_rgba(124,58,237,.25)]'
                     : 'bg-[rgba(18,12,28,.92)] border-[rgba(147,51,234,.28)] shadow-[0_10px_40px_rgba(124,58,237,.18)]'
                   }`}
        style={{
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div className="flex items-center justify-between h-full">
          {/* LOGO */}
          <div className="flex items-center gap-x-4">
            <img src="/apple-touch-icon.png" alt="Logo" className="w-[52px] h-[52px]" />
            <span className="font-bold text-[20px] text-white tracking-wide">ICON EDITZ</span>
          </div>

          {/* MENU */}
          <div className="hidden lg:flex items-center gap-x-12"> {/* 48px gap */}
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                onClick={() => handleNavClick(item)}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex">
            <motion.button
              whileHover={{ scale: 1.04 }}
              onClick={() => scrollToSection('contact')}
              className="h-[56px] px-[34px] text-white font-bold text-base rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7]
                         shadow-[0_0_35px_rgba(168,85,247,.45)] transition-transform duration-200"
            >
              Hire Me
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[rgba(12,10,20,0.85)] backdrop-blur-md lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed top-0 left-0 w-full bg-[rgba(18,12,28,.98)] border-b border-[rgba(147,51,234,.28)] shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center pt-24 pb-12 gap-y-8">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`text-2xl font-bold transition-colors ${
                      activeSection === item.id ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleNavClick({ id: 'contact' })}
                  className="mt-4 h-[56px] px-9 text-white font-bold text-lg rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7]
                             shadow-[0_0_35px_rgba(168,85,247,.45)]"
                >
                  Hire Me
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
