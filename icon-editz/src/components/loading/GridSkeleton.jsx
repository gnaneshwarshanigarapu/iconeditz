import React from 'react'
import CardSkeleton from './CardSkeleton'

export default function GridSkeleton({
  count = 6,
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  cardHeight = 'min-h-[420px]',
  className = '',
}) {
  return (
    <div className={`grid gap-8 ${columns} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} height={cardHeight} />
      ))}
    </div>
  )
}
