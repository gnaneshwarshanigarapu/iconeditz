import React from 'react'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  const isDanger = type === 'danger'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                isDanger ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              }`}
            >
              <FiAlertTriangle className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-text-muted mt-0.5">{message}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-text-muted hover:text-white">
            <FiX />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-text-muted hover:text-white"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition-all ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                : 'bg-primary hover:bg-primary-hover shadow-primary/25'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
