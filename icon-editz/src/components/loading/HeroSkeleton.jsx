import React from 'react'
import Shimmer from './Shimmer'
import ButtonSkeleton from './ButtonSkeleton'
import { Play } from 'lucide-react'

export default function HeroSkeleton() {
  return (
    <section
      id="hero-skeleton"
      className="relative mx-auto flex min-h-[800px] max-w-7xl items-center px-6 pb-20 pt-[140px] lg:px-8 lg:pb-24"
    >
      <div className="absolute inset-0 -z-10 rounded-[2.5rem] border border-violet-500/15 bg-gradient-to-br from-[#130a22]/60 via-[#0a0518]/80 to-[#190d33]/60 backdrop-blur-2xl" />

      <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 items-center">
        {/* Left Hero Content */}
        <div className="max-w-2xl space-y-6">
          {/* Subtitle kicker */}
          <Shimmer className="h-4 w-44 !rounded-full" />

          {/* 3-line Heading Placeholder */}
          <div className="space-y-3">
            <Shimmer className="h-12 w-full sm:h-14 !rounded-2xl" />
            <Shimmer className="h-12 w-11/12 sm:h-14 !rounded-2xl" />
            <Shimmer className="h-12 w-3/4 sm:h-14 !rounded-2xl" />
          </div>

          {/* Subtitle / Paragraph */}
          <div className="space-y-2.5 pt-2">
            <Shimmer className="h-5 w-4/5 !rounded-lg" />
            <Shimmer className="h-4 w-full !rounded" />
            <Shimmer className="h-4 w-5/6 !rounded" />
          </div>

          {/* Two Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <ButtonSkeleton width="w-44" />
            <ButtonSkeleton width="w-36" className="!bg-violet-950/40" />
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Shimmer className="h-8 w-28 !rounded-full" />
            <Shimmer className="h-8 w-28 !rounded-full" />
            <Shimmer className="h-8 w-28 !rounded-full" />
            <Shimmer className="h-8 w-28 !rounded-full" />
          </div>
        </div>

        {/* Right Hero Visual Card */}
        <div className="relative mx-auto flex w-full justify-center">
          {/* Soft Radial Purple Glow behind card */}
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.38),transparent_70%)] blur-3xl animate-pulse"
          />

          {/* Large Rounded 420px Card */}
          <div className="relative flex h-[min(420px,calc(100vw-3rem))] w-[min(420px,calc(100vw-3rem))] items-center justify-center rounded-3xl border border-violet-500/25 bg-[#140a26]/75 shadow-[0_24px_70px_rgba(0,0,0,.6)] backdrop-blur-2xl">
            {/* Pulsing Play Icon Placeholder */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/40 bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 text-violet-300 shadow-[0_0_35px_rgba(124,58,237,0.45)] animate-pulse">
              <Play className="h-8 w-8 ml-1 fill-current opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
