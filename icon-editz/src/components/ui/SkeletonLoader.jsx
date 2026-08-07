import React from 'react'

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="h-8 w-8 rounded-xl bg-white/10" />
      </div>
      <div className="h-8 w-32 rounded bg-white/15" />
      <div className="h-3 w-40 rounded bg-white/10" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="animate-pulse border-b border-white/5">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 rounded bg-white/10" style={{ width: `${Math.floor(Math.random() * 40) + 50}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 rounded bg-white/15" />
        <div className="h-8 w-28 rounded-xl bg-white/10" />
      </div>
      <div className="h-64 w-full rounded-xl bg-white/5 flex items-end justify-between p-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-full rounded-t bg-white/10"
            style={{ height: `${Math.floor(Math.random() * 60) + 30}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-48 rounded bg-white/15" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-10 w-full rounded-xl bg-white/5 border border-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}
