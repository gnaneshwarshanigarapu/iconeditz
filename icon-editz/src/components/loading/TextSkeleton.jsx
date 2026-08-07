import React from 'react'
import Shimmer from './Shimmer'

export default function TextSkeleton({ lines = 1, width = 'w-full', height = 'h-4', className = '' }) {
  if (lines === 1) {
    return <Shimmer className={`${height} ${width} ${className}`} />
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLastLine = index === lines - 1
        const lineW = isLastLine && width === 'w-full' ? 'w-3/4' : width
        return <Shimmer key={index} className={`${height} ${lineW}`} />
      })}
    </div>
  )
}
