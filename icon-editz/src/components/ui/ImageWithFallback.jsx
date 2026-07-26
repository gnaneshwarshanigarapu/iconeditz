import React, { useEffect, useState } from 'react'

export default function ImageWithFallback({ src, alt, className = '', loading = 'lazy', ...props }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const safeSrc = src || '/assets/images/og-icon-editz.png'

  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, [safeSrc])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/10 via-white/5 to-primary/10" />
      ) : null}
      {hasError ? (
        <div className="flex h-full w-full items-center justify-center bg-white/10 text-sm text-text-muted">Image unavailable</div>
      ) : (
        <img
          src={safeSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...props}
        />
      )}
    </div>
  )
}
