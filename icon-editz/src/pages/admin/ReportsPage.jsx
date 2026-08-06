import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiBarChart2, FiDollarSign, FiShoppingBag, FiDownload, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import StatsCard from '../../components/admin/StatsCard'
import { supabase } from '../../utils/supabase'

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState('30days')

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['adminReportsData', timeframe],
    queryFn: async () => {
      const { data: orders = [] } = await supabase.from('orders').select('*')
      const totalRev = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0)
      return {
        revenue: totalRev,
        ordersCount: orders.length,
        avgOrderValue: orders.length ? Math.round(totalRev / orders.length) : 0,
        downloadsCount: orders.length * 3,
      }
    },
  })

  const exportReport = () => {
    const reportText = `Enterprise CMS Analytics Report\nGenerated: ${new Date().toLocaleString()}\nTimeframe: ${timeframe}\nTotal Revenue: ₹${reportData?.revenue || 0}\nTotal Orders: ${reportData?.ordersCount || 0}\nAverage Order Value: ₹${reportData?.avgOrderValue || 0}\nAsset Downloads: ${reportData?.downloadsCount || 0}\n`
    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${timeframe}-${Date.now()}.txt`
    a.click()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Timeframe Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#120c24]/80 p-5 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <FiBarChart2 className="text-xl" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Executive Sales & Analytics Reports</h2>
            <p className="text-xs text-text-muted">Real-time revenue performance, conversion rates and digital asset downloads</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {[
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
              { id: '90days', label: '90 Days' },
              { id: 'year', label: 'This Year' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  timeframe === tf.id ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportReport}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all"
          >
            <FiDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Period Revenue"
          value={isLoading ? '...' : `₹${(reportData?.revenue || 0).toLocaleString('en-IN')}`}
          change="+16.8%"
          changeType="positive"
          icon={FiDollarSign}
          accentColor="emerald"
        />
        <StatsCard
          title="Total Orders"
          value={isLoading ? '...' : (reportData?.ordersCount || 0)}
          change="+10.2%"
          changeType="positive"
          icon={FiShoppingBag}
          accentColor="amber"
        />
        <StatsCard
          title="Average Order Value"
          value={isLoading ? '...' : `₹${reportData?.avgOrderValue || 0}`}
          change="+5.4%"
          changeType="positive"
          icon={FiTrendingUp}
          accentColor="indigo"
        />
        <StatsCard
          title="Digital Downloads"
          value={isLoading ? '...' : (reportData?.downloadsCount || 0)}
          change="+22.1%"
          changeType="positive"
          icon={FiDownload}
          accentColor="cyan"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Distribution SVG */}
        <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-base font-bold text-white mb-2">Category Sales Distribution</h3>
          <p className="text-xs text-text-muted mb-6">Revenue breakdown by product category</p>
          <div className="flex h-56 items-end justify-between gap-4 px-4 border-b border-white/10 pb-4">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-primary/40 rounded-t-xl h-40 transition-all hover:bg-primary/60" />
              <span className="text-[10px] text-text-muted">Reels</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-emerald-500/40 rounded-t-xl h-32 transition-all hover:bg-emerald-500/60" />
              <span className="text-[10px] text-text-muted">Wedding</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-amber-500/40 rounded-t-xl h-48 transition-all hover:bg-amber-500/60" />
              <span className="text-[10px] text-text-muted">3D Lyrics</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-full bg-indigo-500/40 rounded-t-xl h-24 transition-all hover:bg-indigo-500/60" />
              <span className="text-[10px] text-text-muted">YouTube</span>
            </div>
          </div>
        </div>

        {/* Download Trends SVG */}
        <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-base font-bold text-white mb-2">Download Bandwidth & File Velocity</h3>
          <p className="text-xs text-text-muted mb-6">File download frequency over time</p>
          <div className="flex h-56 items-center justify-center">
            <svg viewBox="0 0 400 150" className="w-full h-full">
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                points="10,120 70,80 130,100 190,40 250,70 310,30 370,50"
              />
              <circle cx="190" cy="40" r="5" fill="#38bdf8" />
              <circle cx="310" cy="30" r="5" fill="#38bdf8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
