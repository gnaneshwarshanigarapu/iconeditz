import React from 'react'
import Shimmer from './Shimmer'
import GridSkeleton from './GridSkeleton'

export default function SectionSkeleton({
  kickerWidth = 'w-36',
  headingWidth = 'w-80',
  descriptionWidth = 'w-96',
  cardCount = 6,
  columns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  cardHeight = 'min-h-[420px]',
  className = '',
}) {
  return (
    <section className={`mx-auto max-w-7xl px-6 py-20 lg:px-8 ${className}`}>
      {/* Section Header Skeleton */}
      <div className="mx-auto max-w-2xl text-center space-y-3 mb-14">
        <Shimmer className={`h-4 ${kickerWidth} mx-auto !rounded-full`} />
        <Shimmer className={`h-10 ${headingWidth} mx-auto !rounded-xl`} />
        <Shimmer className={`h-4 ${descriptionWidth} mx-auto !rounded`} />
      </div>

      {/* Grid Content Skeleton */}
      <GridSkeleton count={cardCount} columns={columns} cardHeight={cardHeight} />
    </section>
  )
}
