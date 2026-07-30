import React from 'react';
import { motion } from 'framer-motion';

const NavItem = ({ item, isActive, onClick }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Active state background pill */}
      {isActive && (
        <motion.div
          layoutId="active-pill"
          className="absolute rounded-full"
          style={{
            // Use negative insets to expand the background beyond the text area, creating padding
            top: '-14px',
            bottom: '-14px',
            left: '-28px',
            right: '-28px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.45)',
          }}
        />
      )}

      {/* The actual button/text content */}
      <motion.button
        onClick={onClick}
        className="relative z-10 focus:outline-none font-semibold"
        style={{ fontSize: '17px' }}
        animate={{ color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.78)' }}
        whileHover={{
          // Only apply hover effects if the item is not already active
          color: '#FFFFFF',
          y: isActive ? 0 : -1,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {item.label}
      </motion.button>
    </div>
  );
};

export default NavItem;
