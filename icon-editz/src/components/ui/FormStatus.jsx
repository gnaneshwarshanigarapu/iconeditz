import React from 'react'

export default function FormStatus({ state, message }) {
  if (!state) return null

  const styles = {
    success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    error: 'border-red-400/30 bg-red-400/10 text-red-200',
    loading: 'border-primary/30 bg-primary/10 text-primary',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[state]}`} role="status" aria-live="polite">
      {message}
    </div>
  )
}
