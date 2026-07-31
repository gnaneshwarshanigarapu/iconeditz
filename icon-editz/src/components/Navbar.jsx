import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { scrollToSection } from '../utils/helpers';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Projects', id: 'projects' },
    { label: 'Store', id: 'store' },
    { label: 'Contact', id: 'contact' },
  ];

  useEffect(() => {
    const sectionIds = navItems.map(item => item.id);
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    );

    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

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
        className="fixed top-[20px] left-1/2 -translate-x-1/2 w-[92%] max-w-7xl h-[64px] rounded-full border bg-[rgba(16,10,24,.92)] border-[rgba(168,85,247,.18)] shadow-[0_12px_35px_rgba(124,58,237,.18)] z-[9999]"
        style={{
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        {/* ================================================================================= */}
        {/* ============================= DESKTOP NAVIGATION ================================ */}
        {/* ================================================================================= */}
        <div className="hidden lg:grid grid-cols-[280px_1fr_220px] items-center h-full px-6">
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-x-3">
            <img src="/apple-touch-icon.png" alt="Logo" className="w-12 h-12" />
            <span className="font-bold text-[18px] text-white tracking-wide">ICON EDITZ</span>
          </div>

          {/* CENTER: MENU */}
          <div className="flex items-center justify-center gap-x-[42px]">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <div key={item.id} className="relative">
                  <motion.button
                    onClick={() => handleNavClick(item)}
                    className={`relative z-10 focus:outline-none font-semibold text-[17px] transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                        boxShadow: '0 0 25px rgba(168, 85, 247, 0.35)',
                        padding: '12px 26px',
                      }}
                      initial={false}
                      animate={{
                        top: '-12px',
                        bottom: '-12px',
                        left: '-26px',
                        right: '-26px',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: CTA */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.04 }}
              onClick={() => scrollToSection('contact')}
              className="h-12 px-8 text-white font-bold text-base rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7]
                         shadow-[0_0_35px_rgba(168,85,247,.45)] transition-transform duration-200"
            >
              Hire Me
            </motion.button>
          </div>
        </div>

        {/* ================================================================================= */}
        {/* ============================= MOBILE NAVIGATION ================================= */}
        {/* ================================================================================= */}
        <div className="lg:hidden flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-x-3">
            <img src="/apple-touch-icon.png" alt="Logo" className="w-10 h-10" />
            <span className="font-bold text-lg text-white">ICON EDITZ</span>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? 'x' : 'menu'}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* ================================================================================= */}
      {/* ============================= MOBILE DRAWER ===================================== */}
      {/* ================================================================================= */}
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
