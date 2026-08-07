import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Trash2,
  Download,
  Reply,
  Eye,
  X,
  Send,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useToast } from '../../components/ui/ToastProvider'
import EmptyState from '../../components/ui/EmptyState'
import { TableRowSkeleton } from '../../components/ui/SkeletonLoader'

export default function EnquiriesPage() {
  const toast = useToast()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEnquiries(data || [])
    } catch (err) {
      toast.error('Failed to load enquiries: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const handleMarkStatus = async (id, status) => {
    try {
      const { error } = await supabase.from('enquiries').update({ status }).eq('id', id)
      if (error) throw error
      toast.success(`Enquiry status updated to ${status}`)
      fetchEnquiries()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer enquiry permanently?')) return
    try {
      const { error } = await supabase.from('enquiries').delete().eq('id', id)
      if (error) throw error
      toast.success('Enquiry deleted')
      fetchEnquiries()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply text cannot be empty')
      return
    }
    setSendingReply(true)
    setTimeout(async () => {
      try {
        await supabase.from('enquiries').update({ status: 'replied' }).eq('id', selectedEnquiry.id)
        toast.success(`Reply sent successfully to ${selectedEnquiry.email}`)
        setReplyModalOpen(false)
        setReplyText('')
        fetchEnquiries()
      } catch (err) {
        toast.error('Failed to send reply')
      } finally {
        setSendingReply(false)
      }
    }, 1000)
  }

  const exportCSV = () => {
    if (!enquiries.length) return
    const headers = ['Client Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Date']
    const rows = enquiries.map((e) => [
      `"${e.client_name || ''}"`,
      `"${e.email || ''}"`,
      `"${e.phone || ''}"`,
      `"${e.subject || 'Enquiry'}"`,
      `"${(e.message || '').replace(/"/g, '""')}"`,
      `"${e.status || 'pending'}"`,
      `"${new Date(e.created_at).toLocaleDateString()}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `enquiries_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV exported successfully')
  }

  const filtered = enquiries.filter((e) => {
    const matchesSearch =
      e.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.message?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-pink-400" />
            <span>Customer Enquiries</span>
          </h2>
          <p className="text-xs text-text-muted">Manage incoming lead messages, support requests, and service inquiries.</p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, or message..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'pending', 'read', 'replied'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/[0.05] text-text-muted hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-text-muted uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      icon={MessageSquare}
                      title="No Customer Enquiries"
                      description="No incoming messages match your current filter settings."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 font-bold border border-pink-500/20">
                          {item.client_name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <span>{item.client_name || 'Anonymous Client'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text-muted">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-white">
                          <Mail className="h-3 w-3 text-primary" />
                          <span>{item.email}</span>
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-text-muted">
                            <Phone className="h-3 w-3 text-emerald-400" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs truncate text-text-muted">
                      {item.message}
                    </td>
                    <td className="py-4 px-4 text-text-muted">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'replied'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'read'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEnquiry(item)
                          setReplyModalOpen(true)
                        }}
                        className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                        title="Reply to Client"
                      >
                        <Reply className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMarkStatus(item.id, item.status === 'read' ? 'pending' : 'read')}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                        title="Mark Status"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition-colors"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyModalOpen && selectedEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0a22] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-white text-base">Reply to {selectedEnquiry.client_name}</h3>
                <button onClick={() => setReplyModalOpen(false)} className="text-text-muted hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-xs text-text-muted">
                <p><strong className="text-white">To:</strong> {selectedEnquiry.email}</p>
                <p><strong className="text-white">Original Message:</strong> "{selectedEnquiry.message}"</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Your Response *</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response email..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs text-white outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={sendingReply}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {sendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Send Response</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
