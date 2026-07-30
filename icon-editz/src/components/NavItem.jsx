import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NavItem = ({ item, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={() => onClick(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative font-semibold text-[16px] tracking-[.2px] transition-colors duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full select-none caret-transparent"
      animate={{
        color: isActive || isHovered ? '#FFFFFF' : '#EDEDED',
      }}
      transition={{ duration: 0.25 }}
    >
      <motion.span
        className="relative z-10 block px-[22px] py-[12px]"
        animate={{ y: isHovered ? -2 : 0 }}
        transition={{ duration: 0.25 }}
      >
        {item.label}
      </motion.span>

      <AnimatePresence>
        {(isActive || isHovered) && (
          <motion.div
            layoutId={isActive ? "active-nav-pill" : undefined}
            className="absolute inset-0 bg-[rgba(168,85,247,0.18)] border border-[rgba(168,85,247,0.35)] rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30, duration: 0.25 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default NavItem;
