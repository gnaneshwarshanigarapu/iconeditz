import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Home', to: '/', end: true },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Store', to: '/store' },
]

const linkClass = ({ isActive }) => `inline-flex h-10 items-center justify-center rounded-full border px-[22px] py-[10px] text-[16px] font-semibold whitespace-nowrap select-none caret-transparent transition-all duration-[250ms] ease-in-out ${
  isActive
    ? 'border-white/[.08] bg-[linear-gradient(180deg,#4F2A87,#39205F)] text-white'
    : 'border-transparent bg-transparent text-white/[.78] hover:border-transparent hover:bg-violet-500/[.15] hover:text-white'
}`

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = () => setIsOpen(false)

  return <>
    <div className="fixed top-6 left-0 z-50 w-full">
      <div className="mx-auto w-[84%] max-w-[1380px]">
        <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="h-[60px] rounded-full border border-[rgba(139,92,246,.15)] bg-[#130A22] px-[22px]">
          <div className="hidden h-full items-center xl:flex">
            <Link to="/" className="flex w-[180px] items-center gap-3" aria-label="ICON EDITZ home">
              <img src="/assets/logos/icon-editz.jpg" alt="ICON EDITZ" className="h-10 w-10 rounded-lg" />
              <span className="text-[16px] font-semibold text-white">ICON EDITZ</span>
            </Link>

            <nav aria-label="Primary navigation" className="flex flex-1 items-center justify-center">
              {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>{item.label}</NavLink>)}
            </nav>

            <NavLink to="/hire" className={({ isActive }) => `${linkClass({ isActive })} min-w-[170px]`}>Hire From Us</NavLink>
          </div>

          <div className="flex h-full items-center justify-between xl:hidden">
            <Link to="/" className="flex items-center gap-3" aria-label="ICON EDITZ home"><img src="/assets/logos/icon-editz.jpg" alt="ICON EDITZ" className="h-10 w-10 rounded-lg" /><span className="text-[16px] font-semibold text-white">ICON EDITZ</span></Link>
            <button type="button" onClick={() => setIsOpen((open) => !open)} className="rounded-full p-2 text-white" aria-label="Toggle navigation" aria-expanded={isOpen}><AnimatePresence mode="wait"><motion.span key={isOpen ? 'close' : 'menu'} initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} className="block">{isOpen ? <FiX size={24} /> : <FiMenu size={24} />}</motion.span></AnimatePresence></button>
          </div>
        </motion.header>
      </div>
    </div>

    <AnimatePresence>{isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMenu} className="fixed inset-0 z-40 bg-[#0b0612]/80 backdrop-blur-md xl:hidden"><motion.aside initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ type: 'spring', stiffness: 360, damping: 36 }} onClick={(event) => event.stopPropagation()} className="border-b border-[rgba(139,92,246,.15)] bg-[#130A22] px-6 pb-10 pt-28 shadow-2xl"><nav aria-label="Mobile navigation" className="mx-auto flex max-w-sm flex-col items-center gap-6">{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={closeMenu} className={linkClass}>{item.label}</NavLink>)}<NavLink to="/hire" onClick={closeMenu} className={({ isActive }) => `${linkClass({ isActive })} min-w-[170px]`}>Hire From Us</NavLink></nav></motion.aside></motion.div>}</AnimatePresence>
  </>
}
