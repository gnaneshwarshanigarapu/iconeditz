import React, { useState } from 'react'
import Shimmer from './Shimmer'

export default function ProgressiveImage({
  src,
  alt = '',
  className = '',
  aspectRatio = 'aspect-video',
  decoding = 'async',
  loading = 'lazy',
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {/* Shimmer Placeholder (remains visible until image finishes loading) */}
      {!isLoaded && !hasError && (
        <Shimmer className="absolute inset-0 h-full w-full !rounded-none" />
      )}

      {/* Fallback image container on error */}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#120d1f] text-white/40 text-xs">
          Image unavailable
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  )
}
