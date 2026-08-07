import React from 'react'
import { motion } from 'framer-motion'
import NavbarSkeleton from './NavbarSkeleton'
import HeroSkeleton from './HeroSkeleton'
import SectionSkeleton from './SectionSkeleton'
import Shimmer from './Shimmer'
import CardSkeleton from './CardSkeleton'

export default function PageSkeleton({ page = 'Home' }) {
  return (
    <motion.div
      key={`page-skeleton-${page}`}
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.15),transparent_40%)]" />

      {/* FIXED NAVBAR SKELETON */}
      <NavbarSkeleton />

      {/* PAGE-SPECIFIC SKELETON COMPOSITION */}
      {page === 'Home' && (
        <>
          <HeroSkeleton />
          <SectionSkeleton
            kickerWidth="w-32"
            headingWidth="w-80 sm:w-96"
            descriptionWidth="w-[450px]"
            cardCount={6}
            columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            cardHeight="min-h-[420px]"
          />
          <SectionSkeleton
            kickerWidth="w-36"
            headingWidth="w-80"
            descriptionWidth="w-72"
            cardCount={4}
            columns="grid-cols-1 md:grid-cols-2"
            cardHeight="min-h-[320px]"
          />
          <SectionSkeleton
            kickerWidth="w-32"
            headingWidth="w-72"
            descriptionWidth="w-80"
            cardCount={3}
            columns="grid-cols-1 md:grid-cols-3"
            cardHeight="min-h-[260px]"
          />
        </>
      )}

      {page === 'About' && (
        <>
          <HeroSkeleton />
          {/* Stats Bar */}
          <section className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} height="min-h-[140px]" className="flex flex-col items-center justify-center space-y-2 text-center">
                  <Shimmer className="h-10 w-24 !rounded-xl" />
                  <Shimmer className="h-4 w-32 !rounded" />
                </CardSkeleton>
              ))}
            </div>
          </section>
          <SectionSkeleton cardCount={4} columns="grid-cols-1 md:grid-cols-2" cardHeight="min-h-[320px]" />
        </>
      )}

      {page === 'Services' && (
        <>
          <HeroSkeleton />
          <SectionSkeleton cardCount={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" cardHeight="min-h-[360px]" />
          {/* Pricing Grid Skeleton */}
          <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} height="min-h-[480px]" className="flex flex-col justify-between p-8">
                  <div className="space-y-4">
                    <Shimmer className="h-6 w-32 !rounded-lg" />
                    <Shimmer className="h-10 w-44 !rounded-xl" />
                    <Shimmer className="h-4 w-full" />
                    <div className="space-y-3 pt-6">
                      <Shimmer className="h-4 w-full" />
                      <Shimmer className="h-4 w-5/6" />
                      <Shimmer className="h-4 w-4/5" />
                      <Shimmer className="h-4 w-3/4" />
                    </div>
                  </div>
                  <Shimmer className="h-12 w-full !rounded-full mt-8" />
                </CardSkeleton>
              ))}
            </div>
          </section>
        </>
      )}

      {page === 'Projects' && (
        <>
          <HeroSkeleton />
          {/* Filter Pills */}
          <div className="mx-auto flex max-w-7xl justify-center gap-3 px-6 py-8">
            <Shimmer className="h-10 w-24 !rounded-full" />
            <Shimmer className="h-10 w-28 !rounded-full" />
            <Shimmer className="h-10 w-32 !rounded-full" />
            <Shimmer className="h-10 w-24 !rounded-full" />
          </div>
          <SectionSkeleton cardCount={9} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" cardHeight="min-h-[420px]" />
        </>
      )}

      {page === 'Store' && (
        <>
          <HeroSkeleton />
          <SectionSkeleton cardCount={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" cardHeight="min-h-[380px]" />
        </>
      )}

      {page === 'Hire' && (
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-32 lg:grid-cols-[.82fr_1fr] lg:px-8">
          <div className="space-y-6">
            <Shimmer className="h-6 w-36 !rounded-full" />
            <Shimmer className="h-14 w-full !rounded-2xl" />
            <Shimmer className="h-14 w-4/5 !rounded-2xl" />
            <Shimmer className="h-5 w-full !rounded" />
            <Shimmer className="h-5 w-3/4 !rounded" />
          </div>
          <CardSkeleton height="min-h-[600px]" className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Shimmer className="h-12 w-full !rounded-xl" />
              <Shimmer className="h-12 w-full !rounded-xl" />
              <Shimmer className="h-12 w-full !rounded-xl" />
              <Shimmer className="h-12 w-full !rounded-xl" />
            </div>
            <Shimmer className="h-32 w-full !rounded-xl" />
            <Shimmer className="h-12 w-full !rounded-full" />
          </CardSkeleton>
        </section>
      )}

      {/* FOOTER SKELETON */}
      <footer className="border-t border-violet-500/15 bg-[#070310] py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shimmer className="h-10 w-10 !rounded-lg" />
              <Shimmer className="h-6 w-32 !rounded" />
            </div>
            <Shimmer className="h-4 w-48" />
            <Shimmer className="h-4 w-40" />
          </div>
          <div className="space-y-3">
            <Shimmer className="h-5 w-24 mb-2" />
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            <Shimmer className="h-5 w-28 mb-2" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-4 w-28" />
          </div>
          <div className="space-y-4">
            <Shimmer className="h-5 w-32" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Shimmer key={i} className="h-10 w-10 !rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  )
}
