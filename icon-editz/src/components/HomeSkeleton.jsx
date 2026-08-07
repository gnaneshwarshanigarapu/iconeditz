import React from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export function SkeletonBox({ className = '' }) {
  return <div className={`shimmer-purple rounded-xl ${className}`} />
}

export function SkeletonCard({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-violet-500/15 bg-[#120824]/60 p-6 backdrop-blur-xl shadow-xl ${className}`}>
      {children}
    </div>
  )
}

export default function HomeSkeleton() {
  return (
    <motion.div
      key="home-skeleton"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        filter: 'blur(4px)',
        transition: { duration: 0.4 },
      }}
      className="relative min-h-screen w-full overflow-hidden bg-[#05020a] text-white"
    >
      {/* Background Mesh Glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(157,92,255,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),transparent_40%)]" />

      {/* NAVBAR SKELETON */}
      <div className="fixed top-6 left-0 z-50 w-full pointer-events-none">
        <div className="mx-auto w-[84%] max-w-[1380px]">
          <div className="flex h-[60px] items-center justify-between rounded-full border border-violet-500/20 bg-[#130A22]/90 px-6 backdrop-blur-xl shadow-2xl">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-10 w-10 !rounded-lg" />
              <SkeletonBox className="h-5 w-28" />
            </div>

            {/* Nav links */}
            <div className="hidden items-center gap-4 xl:flex">
              <SkeletonBox className="h-8 w-20 !rounded-full" />
              <SkeletonBox className="h-8 w-20 !rounded-full" />
              <SkeletonBox className="h-8 w-20 !rounded-full" />
              <SkeletonBox className="h-8 w-20 !rounded-full" />
              <SkeletonBox className="h-8 w-20 !rounded-full" />
            </div>

            {/* CTA Button */}
            <div className="hidden sm:block">
              <SkeletonBox className="h-10 w-36 !rounded-full" />
            </div>

            {/* Mobile menu icon placeholder */}
            <div className="sm:hidden">
              <SkeletonBox className="h-8 w-8 !rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION SKELETON */}
      <section id="hero-skeleton" className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center px-6 pb-20 pt-[140px] lg:px-8 lg:pb-24">
        <div className="absolute inset-0 -z-10 rounded-[2.5rem] border border-violet-500/10 bg-gradient-to-br from-violet-950/20 via-black/40 to-purple-950/20" />
        
        <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 items-center">
          {/* Left Hero Side */}
          <div className="max-w-2xl space-y-6">
            {/* Small subtitle kicker */}
            <SkeletonBox className="h-4 w-44 !rounded-full" />

            {/* Large 3-line heading shimmer */}
            <div className="space-y-3">
              <SkeletonBox className="h-12 w-full sm:h-14 !rounded-2xl" />
              <SkeletonBox className="h-12 w-11/12 sm:h-14 !rounded-2xl" />
              <SkeletonBox className="h-12 w-3/4 sm:h-14 !rounded-2xl" />
            </div>

            {/* Subtitle / Paragraph */}
            <div className="space-y-2 pt-2">
              <SkeletonBox className="h-5 w-4/5" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-5/6" />
            </div>

            {/* Two Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <SkeletonBox className="h-12 w-44 !rounded-full shadow-[0_0_20px_rgba(168,85,247,0.25)]" />
              <SkeletonBox className="h-12 w-36 !rounded-full" />
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              <SkeletonBox className="h-8 w-28 !rounded-full" />
              <SkeletonBox className="h-8 w-28 !rounded-full" />
              <SkeletonBox className="h-8 w-28 !rounded-full" />
              <SkeletonBox className="h-8 w-28 !rounded-full" />
            </div>
          </div>

          {/* Right Hero Side */}
          <div className="relative mx-auto flex w-full justify-center">
            {/* Soft Radial Glow behind card */}
            <div aria-hidden="true" className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.35),transparent_70%)] blur-3xl animate-pulse" />
            
            {/* Large Rounded Card */}
            <div className="relative flex h-[min(420px,calc(100vw-3rem))] w-[min(420px,calc(100vw-3rem))] items-center justify-center rounded-3xl border border-violet-500/25 bg-[#140a26]/70 shadow-[0_24px_70px_rgba(0,0,0,.6)] backdrop-blur-2xl">
              {/* Pulsing Play Icon Placeholder */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/40 bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 text-violet-300 shadow-[0_0_35px_rgba(168,85,247,0.4)] animate-pulse">
                <Play className="h-8 w-8 ml-1 fill-current opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS SECTION SKELETON */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-14">
          <SkeletonBox className="h-4 w-32 mx-auto !rounded-full" />
          <SkeletonBox className="h-10 w-72 sm:w-96 mx-auto !rounded-xl" />
          <SkeletonBox className="h-4 w-80 sm:w-[480px] mx-auto" />
        </div>

        {/* 6 Project Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} className="flex flex-col justify-between">
              <div>
                {/* Image Placeholder */}
                <SkeletonBox className="h-52 w-full !rounded-2xl mb-5" />
                
                {/* Tag & Title */}
                <SkeletonBox className="h-3 w-20 !rounded-full mb-3" />
                <SkeletonBox className="h-6 w-4/5 mb-3" />
                
                {/* Paragraph */}
                <SkeletonBox className="h-4 w-full mb-2" />
                <SkeletonBox className="h-4 w-3/4 mb-6" />
              </div>

              {/* Action Button */}
              <SkeletonBox className="h-10 w-32 !rounded-full" />
            </SkeletonCard>
          ))}
        </div>
      </section>

      {/* SERVICES SECTION SKELETON */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-14">
          <SkeletonBox className="h-4 w-36 mx-auto !rounded-full" />
          <SkeletonBox className="h-10 w-80 mx-auto !rounded-xl" />
          <SkeletonBox className="h-4 w-72 mx-auto" />
        </div>

        {/* 4 Service Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="flex items-start gap-6 p-8">
              {/* Icon Placeholder */}
              <SkeletonBox className="h-14 w-14 shrink-0 !rounded-2xl" />
              
              {/* Text Content */}
              <div className="w-full space-y-3">
                <SkeletonBox className="h-6 w-48 !rounded-lg" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-5/6" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION SKELETON */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-14">
          <SkeletonBox className="h-4 w-36 mx-auto !rounded-full" />
          <SkeletonBox className="h-10 w-72 mx-auto !rounded-xl" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="space-y-4">
              <div className="flex items-center gap-4">
                <SkeletonBox className="h-12 w-12 shrink-0 !rounded-full" />
                <div className="space-y-2">
                  <SkeletonBox className="h-4 w-32" />
                  <SkeletonBox className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-2/3" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </section>

      {/* FOOTER SKELETON */}
      <footer className="border-t border-violet-500/15 bg-[#070310] py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-10 w-10 !rounded-lg" />
              <SkeletonBox className="h-6 w-32" />
            </div>
            <SkeletonBox className="h-4 w-48" />
            <SkeletonBox className="h-4 w-40" />
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <SkeletonBox className="h-5 w-24 mb-2" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-4 w-16" />
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <SkeletonBox className="h-5 w-28 mb-2" />
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-28" />
          </div>

          {/* Col 4 */}
          <div className="space-y-4">
            <SkeletonBox className="h-5 w-32" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} className="h-10 w-10 !rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}
