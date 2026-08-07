import React, { useEffect, useRef, useState } from 'react'
import Shimmer from './Shimmer'
import { Play } from 'lucide-react'

export default function ProgressiveVideo({
  src,
  poster,
  alt = 'Video preview',
  aspectRatio = 'aspect-video',
  className = '',
  autoPlay = false,
  loop = true,
  muted = true,
  playsInline = true,
  controls = false,
}) {
  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#120d1f] ${aspectRatio} ${className}`}
    >
      {/* Animated Poster / Shimmer Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {poster ? (
            <img
              src={poster}
              alt={alt}
              className="h-full w-full object-cover opacity-60 filter blur-xs"
            />
          ) : (
            <Shimmer className="absolute inset-0 h-full w-full !rounded-none" />
          )}
          <div className="absolute z-10 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/50 text-white backdrop-blur-md animate-pulse">
            <Play className="h-6 w-6 ml-0.5 fill-current" />
          </div>
        </div>
      )}

      {/* Lazy Loaded Video */}
      {isVisible && (
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          controls={controls}
          onLoadedData={() => setIsLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
