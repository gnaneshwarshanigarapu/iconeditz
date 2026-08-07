import React from 'react'
import Shimmer from './Shimmer'

export default function ButtonSkeleton({ width = 'w-36', height = 'h-[48px]', className = '' }) {
  return (
    <Shimmer
      className={`${height} ${width} !rounded-full shadow-[0_0_24px_rgba(124,58,237,0.25)] ${className}`}
    />
  )
}
