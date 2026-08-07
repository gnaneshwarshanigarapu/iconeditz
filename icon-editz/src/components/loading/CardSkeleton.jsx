import React from 'react'
import Shimmer from './Shimmer'

export default function CardSkeleton({ height = 'min-h-[420px]', children, className = '' }) {
  return (
    <div className={`shimmer-card relative overflow-hidden rounded-[2rem] p-6 backdrop-blur-xl ${height} ${className}`}>
      {children || (
        <div className="flex flex-col justify-between h-full space-y-4">
          <Shimmer className="h-48 w-full !rounded-2xl" />
          <Shimmer className="h-4 w-24 !rounded-full" />
          <Shimmer className="h-6 w-3/4 !rounded-lg" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-2/3" />
          <div className="pt-2">
            <Shimmer className="h-10 w-32 !rounded-full" />
          </div>
        </div>
      )}
    </div>
  )
}
