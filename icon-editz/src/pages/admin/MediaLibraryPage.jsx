import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FiUploadCloud,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiImage,
  FiVideo,
  FiFileText,
  FiExternalLink,
  FiCheckSquare,
  FiSquare,
} from 'react-icons/fi'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

export default function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [copiedUrl, setCopiedUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Fetch items from /api/uploads
  const { data: mediaItems = [], isLoading, refetch } = useQuery({
    queryKey: ['mediaLibraryFilesFull'],
    queryFn: async () => {
      const res = await fetch('/api/uploads?folder=uploads')
      if (!res.ok) return []
      const json = await res.json()
      return json.data || []
    },
  })

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'uploads')
        await fetch('/api/uploads', { method: 'POST', body: formData })
      }
      refetch()
    } catch (err) {
      alert(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(''), 2000)
  }

  const toggleSelectItem = (key) => {
    const next = new Set(selectedItems)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelectedItems(next)
  }

  const handleBulkDelete = async () => {
    try {
      for (const key of Array.from(selectedItems)) {
        await fetch('/api/uploads', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        })
      }
      setSelectedItems(new Set())
      setDeleteModalOpen(false)
      refetch()
    } catch (err) {
      alert(`Delete error: ${err.message}`)
    }
  }

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch = (item.name || '').toLowerCase().includes(search.toLowerCase())
    if (activeTab === 'image') return matchesSearch && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.name)
    if (activeTab === 'video') return matchesSearch && /\.(mp4|webm|mov)$/i.test(item.name)
    if (activeTab === 'document') return matchesSearch && /\.(zip|pdf)$/i.test(item.name)
    return matchesSearch
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#120c24]/80 p-5 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <FiFolder className="text-xl" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Media Asset Library</h2>
            <p className="text-xs text-text-muted">Cloudflare R2 & Supabase Storage file assets</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {selectedItems.size > 0 && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-500/30 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/30 transition-all"
            >
              <FiTrash2 /> Delete Selected ({selectedItems.size})
            </button>
          )}

          <label className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.02] cursor-pointer transition-all">
            <FiUploadCloud className="text-base" />
            <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#120c24]/80 p-4 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'image', label: 'Images' },
            { id: 'video', label: 'Videos' },
            { id: 'document', label: 'ZIP / PDF' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search media by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 py-2 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-12 text-center shadow-xl">
          <FiImage className="mx-auto text-5xl text-white/20 mb-3" />
          <h3 className="text-base font-bold text-white">No Assets Found</h3>
          <p className="text-xs text-text-muted mt-1">Upload images, videos or documents to populate your media storage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredItems.map((item) => {
            const isSelected = selectedItems.has(item.key)
            const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.name)
            const isVid = /\.(mp4|webm|mov)$/i.test(item.name)

            return (
              <div
                key={item.key}
                className={`group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border p-2 shadow-lg transition-all duration-300 ${
                  isSelected
                    ? 'border-primary bg-primary/20 ring-2 ring-primary/50'
                    : 'border-white/10 bg-[#120c24]/90 hover:border-white/30 hover:scale-[1.02]'
                }`}
              >
                {/* Media Preview */}
                <div
                  onClick={() => setPreviewItem(item)}
                  className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-black/40 cursor-pointer"
                >
                  {isImg ? (
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : isVid ? (
                    <div className="flex flex-col items-center justify-center">
                      <FiVideo className="text-3xl text-primary mb-1" />
                      <span className="text-[10px] text-text-muted truncate max-w-full px-2">{item.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <FiFileText className="text-3xl text-amber-400 mb-1" />
                      <span className="text-[10px] text-text-muted truncate max-w-full px-2">{item.name}</span>
                    </div>
                  )}
                </div>

                {/* Selection Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleSelectItem(item.key)}
                  className="absolute top-3 left-3 z-10 text-white drop-shadow-md"
                >
                  {isSelected ? (
                    <FiCheckSquare className="text-xl text-primary fill-primary/30" />
                  ) : (
                    <FiSquare className="text-xl text-white/70 hover:text-white" />
                  )}
                </button>

                {/* Copy URL Hover Button */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.url)}
                  className="absolute bottom-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy Public URL"
                >
                  {copiedUrl === item.url ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Asset Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-base font-bold text-white truncate max-w-md">{previewItem.name}</h3>
              <button onClick={() => setPreviewItem(null)} className="text-text-muted hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-black/60 mb-4">
              {/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(previewItem.name) ? (
                <img src={previewItem.url} alt={previewItem.name} className="h-full w-full object-contain" />
              ) : /\.(mp4|webm|mov)$/i.test(previewItem.name) ? (
                <video src={previewItem.url} controls className="h-full w-full object-contain" />
              ) : (
                <div className="text-center p-8">
                  <FiFileText className="mx-auto text-5xl text-amber-400 mb-2" />
                  <p className="text-xs text-text-muted">Document / ZIP Archive</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-white/[0.03] p-3 text-xs font-mono text-text-muted border border-white/5">
              <div className="flex items-center justify-between">
                <span>Public Storage URL:</span>
                <button
                  onClick={() => copyToClipboard(previewItem.url)}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <FiCopy /> {copiedUrl === previewItem.url ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <span className="truncate text-emerald-400">{previewItem.url}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Storage Objects"
        message={`Are you sure you want to delete ${selectedItems.size} selected file(s) from storage?`}
        confirmText="Delete Files"
        onConfirm={handleBulkDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}
