import React from 'react'
import { FiSearch, FiDownload, FiFilter, FiPlus } from 'react-icons/fi'

export default function DataFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  categories = [],
  selectedCategory,
  onCategoryChange,
  statusOptions = [],
  selectedStatus,
  onStatusChange,
  onExportCSV,
  onExportExcel,
  onExportPDF,
  actionButtonText,
  onActionClick,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#120c24]/80 p-4 shadow-xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
        />
      </div>

      {/* Filters & Export Options */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Dropdown */}
        {categories.length > 0 && (
          <select
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#170e30] px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-primary/50 transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id || cat} value={cat.name || cat}>
                {cat.name || cat}
              </option>
            ))}
          </select>
        )}

        {/* Status Dropdown */}
        {statusOptions.length > 0 && (
          <select
            value={selectedStatus || ''}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#170e30] px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-primary/50 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st.toUpperCase()}
              </option>
            ))}
          </select>
        )}

        {/* Export Buttons */}
        {onExportCSV && (
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-text-muted hover:text-white hover:bg-white/[0.1] transition-all"
            title="Export CSV"
          >
            <FiDownload /> CSV
          </button>
        )}

        {onExportExcel && (
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
            title="Export Excel"
          >
            <FiDownload /> Excel
          </button>
        )}

        {onExportPDF && (
          <button
            type="button"
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
            title="Export PDF"
          >
            <FiDownload /> PDF
          </button>
        )}

        {/* Action Button */}
        {actionButtonText && onActionClick && (
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.02] transition-all"
          >
            <FiPlus className="text-base" />
            <span>{actionButtonText}</span>
          </button>
        )}
      </div>
    </div>
  )
}
