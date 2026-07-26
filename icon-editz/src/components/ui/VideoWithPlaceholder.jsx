import React, { useEffect, useRef, useState } from 'react'

export default function VideoWithPlaceholder({ src, poster, title, className = '' }) {
  const videoRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const node = videoRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            node.play().catch(() => {})
          } else {
            setIsVisible(false)
            node.pause()
          }
        })
      },
      { rootMargin: '200px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isReady ? (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-white/10 via-white/5 to-primary/10" />
      ) : null}
      {poster ? <img src={poster || '/assets/images/og-icon-editz.png'} alt={title || 'Video preview'} className={`absolute inset-0 h-full w-full object-cover ${isReady ? 'opacity-0' : 'opacity-100'}`} loading="lazy" /> : null}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className={`h-full w-full object-cover transition duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          onCanPlay={() => setIsReady(true)}
        />
      ) : null}
    </div>
  )
}
