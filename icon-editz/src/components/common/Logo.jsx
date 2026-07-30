import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'w-10 h-10', variant = 'light', showText = true, className = '' }) => {
  // The variant prop is not used yet, as we only have one logo image.
  // In the future, we can use this prop to switch between a light and dark version of the logo.

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
        <img
          src="/assets/logos/icon-editz.jpg"
          alt="Icon Editz Logo"
          className={`relative ${size} rounded-full object-cover border-2 border-primary/30 group-hover:border-primary/70 transition-colors duration-300`}
        />
      </div>
      {showText && (
        <span className="font-bold text-[18px] text-text hidden sm:block tracking-wide group-hover:text-primary transition-colors duration-300">
          ICON EDITZ
        </span>
      )}
    </Link>
  );
};

export default Logo;
