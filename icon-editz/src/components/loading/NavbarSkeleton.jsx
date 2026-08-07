import React from 'react'
import Shimmer from './Shimmer'

export default function NavbarSkeleton() {
  return (
    <div className="fixed top-6 left-0 z-50 w-full pointer-events-none">
      <div className="mx-auto w-[84%] max-w-[1380px]">
        <div className="flex h-[60px] items-center justify-between rounded-full border border-violet-500/20 bg-[#130A22]/90 px-6 backdrop-blur-xl shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Shimmer className="h-10 w-10 !rounded-lg" />
            <Shimmer className="h-5 w-28 !rounded" />
          </div>

          {/* Nav Items */}
          <div className="hidden items-center gap-4 xl:flex">
            <Shimmer className="h-8 w-20 !rounded-full" />
            <Shimmer className="h-8 w-20 !rounded-full" />
            <Shimmer className="h-8 w-20 !rounded-full" />
            <Shimmer className="h-8 w-20 !rounded-full" />
            <Shimmer className="h-8 w-20 !rounded-full" />
          </div>

          {/* CTA Button */}
          <div className="hidden sm:block">
            <Shimmer className="h-10 w-36 !rounded-full" />
          </div>

          {/* Mobile Menu Icon */}
          <div className="sm:hidden">
            <Shimmer className="h-8 w-8 !rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
