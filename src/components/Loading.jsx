import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="flex flex-col items-center gap-4">
        <img src="/assets/logos/icon-editz.jpg" alt="Icon Editz" className="w-28 h-28 rounded-full shadow-2xl" />
        <div className="text-center">
          <p className="text-sm text-text-muted">Loading Icon Editz</p>
        </div>
      </div>
    </div>
  )
}
