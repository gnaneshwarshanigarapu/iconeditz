import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiUpload, FiX, FiCheck, FiSearch, FiFileText, FiImage, FiVideo, FiCopy } from 'react-icons/fi'
import { getSupabaseAdmin } from '../../../server/lib/supabaseAdmin'

export default function MediaPickerModal({ isOpen, onClose, onSelect, allowedTypes = ['image', 'video', 'all'] }) {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState('')

  // Fetch storage objects
  const { data: mediaItems = [], isLoading, refetch } = useQuery({
    queryKey: ['mediaLibraryFiles'],
    queryFn: async () => {
      const res = await fetch('/api/uploads?folder=uploads')
      if (!res.ok) {
        // Fallback to empty array
        return []
      }
      const json = await res.json()
      return json.data || []
    },
    enabled: isOpen,
  })

  if (!isOpen) return null

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'uploads')

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json()
      if (json.data?.url) {
        setSelectedUrl(json.data.url)
        refetch()
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const filteredItems = mediaItems.filter((item) => {
    const nameMatches = (item.name || '').toLowerCase().includes(search.toLowerCase())
    if (activeTab === 'image') return nameMatches && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.name)
    if (activeTab === 'video') return nameMatches && /\.(mp4|webm|mov)$/i.test(item.name)
    if (activeTab === 'document') return nameMatches && /\.(zip|pdf)$/i.test(item.name)
    return nameMatches
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="flex h-[85vh] w-full max-w-5xl flex-col rounded-2xl border border-white/10 bg-[#120c24] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Media Library Picker</h2>
            <p className="text-xs text-text-muted">Select an uploaded asset or upload a new file to Storage</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-text-muted hover:text-white"
          >
            <FiX />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/10 bg-[#0e081f] px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {['all', 'image', 'video', 'document'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white/5 text-text-muted hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted" />
              <input
                type="text"
                placeholder="Filter files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary/50"
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 cursor-pointer transition-all">
              <FiUpload />
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
              <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Modal Body: File Grid */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <FiImage className="text-4xl text-white/20 mb-2" />
              <p className="text-sm font-semibold text-white">No media files found</p>
              <p className="text-xs text-text-muted mt-1">Upload a file above to add to your library</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
              {filteredItems.map((item) => {
                const isSelected = selectedUrl === item.url
                const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.name)
                const isVid = /\.(mp4|webm|mov)$/i.test(item.name)

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative flex aspect-square flex-col items-center justify-between overflow-hidden rounded-xl border p-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/20 ring-2 ring-primary/50'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'
                    }`}
                  >
                    {isImg ? (
                      <img src={item.url} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                    ) : isVid ? (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-black/40 rounded-lg">
                        <FiVideo className="text-2xl text-primary mb-1" />
                        <span className="text-[10px] text-text-muted truncate max-w-full px-1">{item.name}</span>
                      </div>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-black/40 rounded-lg">
                        <FiFileText className="text-2xl text-amber-400 mb-1" />
                        <span className="text-[10px] text-text-muted truncate max-w-full px-1">{item.name}</span>
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs shadow-md">
                        <FiCheck />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#0e081f] px-6 py-4">
          <div className="truncate max-w-md text-xs text-text-muted">
            {selectedUrl ? (
              <span className="text-emerald-400 font-mono truncate block">Selected: {selectedUrl}</span>
            ) : (
              'Click an asset above to select'
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              disabled={!selectedUrl}
              onClick={() => {
                if (selectedUrl) {
                  onSelect(selectedUrl)
                  onClose()
                }
              }}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover disabled:opacity-50"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
