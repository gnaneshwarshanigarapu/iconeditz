import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen({ message = 'Preparing your experience…' }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#05020a] px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-primary/20 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/20" />
        </div>
        <div className="mb-6 h-8 w-3/4 animate-pulse rounded-full bg-gradient-to-r from-primary/40 to-white/10" />
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0.5, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: item * 0.1, duration: 0.25 }}
              className="h-4 rounded-full bg-white/10"
            />
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="aspect-video animate-pulse rounded-[1.2rem] border border-white/10 bg-white/10" />
          <div className="space-y-3">
            <div className="h-4 w-2/3 rounded-full bg-white/10" />
            <div className="h-4 w-full rounded-full bg-white/10" />
            <div className="h-4 w-5/6 rounded-full bg-white/10" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-text-muted">{message}</p>
      </div>
    </div>
  )
}
