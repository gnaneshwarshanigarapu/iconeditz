import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FiRefreshCw,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiDollarSign,
  FiShoppingBag,
  FiBox,
  FiUsers,
  FiZap,
  FiTrendingUp,
  FiCreditCard,
  FiActivity,
  FiXCircle,
} from 'react-icons/fi'
import { api } from '../../services/api'

const STATUS_COLORS = {
  paid: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  captured: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  failed: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  refunded: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
}

const STATUS_ICONS = {
  paid: FiCheckCircle,
  success: FiCheckCircle,
  captured: FiCheckCircle,
  pending: FiClock,
  failed: FiXCircle,
  refunded: FiAlertTriangle,
}

function getStatusKey(order) {
  return (order.payment_status || order.status || 'pending').toLowerCase()
}

function StatCard({ icon: Icon, iconColor, label, value, subLabel, subValue, subColor }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e081f]/90 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-white/[0.03] to-transparent transition-transform duration-500 group-hover:scale-150" />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted/80">
            {label}
          </span>
          <p className="mt-1.5 text-2xl font-black text-white lg:text-3xl">{value}</p>
          {subLabel && (
            <p className={`mt-1 text-[11px] font-semibold ${subColor || 'text-text-muted'}`}>
              {subLabel}: {subValue}
            </p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] ${iconColor || 'text-primary'}`}>
          <Icon className="text-lg" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const queryClient = useQueryClient()

  // Fetch aggregated metrics from server-side API
  const { data: metrics, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['adminDashboardMetrics'],
    queryFn: async () => {
      const res = await api.get('/api/admin')
      return res.data
    },
    refetchInterval: 30000,
    staleTime: 10000,
  })

  // Razorpay Live Sync — reconcile DB with live Razorpay statuses
  const handleRazorpaySync = useCallback(async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await api.put('/api/admin', {})
      setSyncResult(res.data)
      // Refetch all dashboard and order queries after sync
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ['adminOrdersList'] }),
        queryClient.invalidateQueries({ queryKey: ['adminCustomersList'] }),
        queryClient.invalidateQueries({ queryKey: ['adminPaymentAttempts'] }),
      ])
    } catch (err) {
      setSyncResult({ error: err.message || 'Sync failed. Check Razorpay API keys.' })
    } finally {
      setSyncing(false)
    }
  }, [refetch, queryClient])

  // Manual refresh (just refetch metrics, no Razorpay API call)
  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const lastSyncTime = metrics?.syncedAt
    ? new Date(metrics.syncedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : null

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
              DASHBOARD
            </span>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">CMS Overview</h1>
            <p className="mt-1 text-xs text-text-muted max-w-2xl">
              Real-time metrics aggregated from verified Razorpay payments. Revenue counts only captured/PAID orders.
            </p>

            {/* Action Buttons Row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Refresh Metrics */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Loading...' : 'Refresh Metrics'}</span>
              </button>

              {/* Razorpay Sync Button */}
              <button
                onClick={handleRazorpaySync}
                disabled={syncing}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 to-violet-500/20 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/10 hover:from-primary/30 hover:to-violet-500/30 transition-all disabled:opacity-50"
              >
                <FiZap className={syncing ? 'animate-pulse text-amber-300' : 'text-primary'} />
                <span>{syncing ? 'Syncing with Razorpay...' : 'Razorpay Live Sync'}</span>
              </button>
            </div>

            {/* Last Synced Timestamp */}
            {lastSyncTime && (
              <p className="mt-2.5 text-[10px] text-text-muted/60 font-mono">
                Last synced: {lastSyncTime}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#090414] px-4 py-2.5 text-right shadow-inner">
            <span className="block text-[9px] font-extrabold uppercase tracking-widest text-text-muted">
              CURRENT ROLE
            </span>
            <span className="text-sm font-black text-white">super_admin</span>
          </div>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div className={`rounded-xl border p-4 text-xs font-semibold backdrop-blur-xl transition-all animate-in fade-in duration-300 ${
          syncResult.error
            ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
            : syncResult.updated > 0
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncResult.error ? (
                <>
                  <FiXCircle /> Sync Error: {syncResult.error}
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  <span>
                    Razorpay Sync Complete — {syncResult.totalProcessed} orders processed,{' '}
                    <span className="font-black">{syncResult.updated} updated</span>,{' '}
                    {syncResult.failed > 0 && <span className="text-rose-300">{syncResult.failed} failed</span>}
                  </span>
                </>
              )}
            </div>
            <button onClick={() => setSyncResult(null)} className="text-white/50 hover:text-white ml-3">✕</button>
          </div>

          {/* Show individual sync results */}
          {syncResult.results && syncResult.results.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
              {syncResult.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-white/60">#{r.orderId}</span>
                  <span className="text-amber-300">{r.previousStatus}</span>
                  <span className="text-white/40">→</span>
                  <span className="text-emerald-400 font-bold">{r.newStatus}</span>
                  <span className="text-white/30 text-[10px]">(Razorpay: {r.razorpayStatus})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={FiDollarSign}
          iconColor="text-emerald-400"
          label="PAID REVENUE"
          value={isLoading ? '...' : `₹${(metrics?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subLabel="Pending"
          subValue={`₹${(metrics?.pendingRevenue || 0).toLocaleString('en-IN')}`}
          subColor="text-amber-400"
        />
        <StatCard
          icon={FiShoppingBag}
          iconColor="text-amber-400"
          label="TOTAL ORDERS"
          value={isLoading ? '...' : metrics?.totalOrders || 0}
          subLabel="Paid"
          subValue={`${metrics?.paidOrders || 0} of ${metrics?.totalOrders || 0}`}
          subColor="text-emerald-400"
        />
        <StatCard
          icon={FiBox}
          iconColor="text-blue-400"
          label="TOTAL PRODUCTS"
          value={isLoading ? '...' : metrics?.totalProducts || 0}
        />
        <StatCard
          icon={FiUsers}
          iconColor="text-indigo-400"
          label="TOTAL CUSTOMERS"
          value={isLoading ? '...' : metrics?.totalCustomers || 0}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted/80">
            <FiTrendingUp className="text-cyan-400" /> TODAY
          </div>
          <p className="mt-1 text-lg font-black text-white">{isLoading ? '...' : metrics?.todayOrders || 0} orders</p>
          <p className="text-[11px] font-semibold text-emerald-400">₹{(metrics?.todayRevenue || 0).toLocaleString('en-IN')}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted/80">
            <FiClock className="text-amber-400" /> PENDING
          </div>
          <p className="mt-1 text-lg font-black text-amber-400">{isLoading ? '...' : metrics?.pendingOrders || 0}</p>
          <p className="text-[11px] font-semibold text-text-muted">awaiting payment</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted/80">
            <FiXCircle className="text-rose-400" /> FAILED
          </div>
          <p className="mt-1 text-lg font-black text-rose-400">{isLoading ? '...' : metrics?.failedOrders || 0}</p>
          <p className="text-[11px] font-semibold text-text-muted">dropped off</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted/80">
            <FiActivity className="text-violet-400" /> REFUNDED
          </div>
          <p className="mt-1 text-lg font-black text-violet-400">{isLoading ? '...' : metrics?.refundedOrders || 0}</p>
          <p className="text-[11px] font-semibold text-text-muted">refund issued</p>
        </div>
      </div>

      {/* Payment Attempts Mini Stats */}
      {(metrics?.totalAttempts > 0) && (
        <div className="rounded-xl border border-white/10 bg-[#0e081f]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <FiCreditCard className="text-primary" />
            <span className="text-xs font-bold text-white">Payment Gateway Health</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-black text-emerald-400">{metrics.capturedAttempts}</p>
              <p className="text-[10px] text-text-muted uppercase font-bold">Captured</p>
            </div>
            <div>
              <p className="text-xl font-black text-rose-400">{metrics.failedAttempts}</p>
              <p className="text-[10px] text-text-muted uppercase font-bold">Failed</p>
            </div>
            <div>
              <p className="text-xl font-black text-white">{metrics.totalAttempts}</p>
              <p className="text-[10px] text-text-muted uppercase font-bold">Total Attempts</p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${metrics.totalAttempts ? Math.round((metrics.capturedAttempts / metrics.totalAttempts) * 100) : 0}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-text-muted text-right font-mono">
            {metrics.totalAttempts ? Math.round((metrics.capturedAttempts / metrics.totalAttempts) * 100) : 0}% capture rate
          </p>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/admin/orders"
          className="group rounded-2xl border border-white/10 bg-[#0e081f]/90 p-5 shadow-xl backdrop-blur-xl hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Orders</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">View all orders with product items, payment status, and customer details.</p>
            </div>
            <FiArrowUpRight className="text-lg text-text-muted group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link
          to="/admin/customers"
          className="group rounded-2xl border border-white/10 bg-[#0e081f]/90 p-5 shadow-xl backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Customers</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">Customer profiles with LTV, purchase history, and contact details.</p>
            </div>
            <FiArrowUpRight className="text-lg text-text-muted group-hover:text-indigo-400 transition-colors" />
          </div>
        </Link>

        <Link
          to="/admin/payment-attempts"
          className="group rounded-2xl border border-white/10 bg-[#0e081f]/90 p-5 shadow-xl backdrop-blur-xl hover:border-rose-500/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Payment Attempts</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">Razorpay webhook logs, gateway errors, and recovery actions.</p>
            </div>
            <FiArrowUpRight className="text-lg text-text-muted group-hover:text-rose-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Latest Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-text-muted">Latest 10 orders synced from database — status from Razorpay webhooks</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <span>View All Orders</span> <FiArrowUpRight />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : !metrics?.latestOrders || metrics.latestOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">No order transactions found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Razorpay ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.latestOrders.map((order) => {
                  const statusKey = getStatusKey(order)
                  const colorClass = STATUS_COLORS[statusKey] || STATUS_COLORS.pending
                  const StatusIcon = STATUS_ICONS[statusKey] || FiClock

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">#{order.id.slice(0, 8)}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-white">{order.customer_name || 'Customer'}</p>
                          <p className="text-[10px] text-text-muted">{order.customer_email || order.user_email || order.email || ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">₹{order.amount || order.total_amount || 0}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-text-muted">
                        {order.razorpay_payment_id || order.razorpay_order_id || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-semibold text-[10px] ${colorClass}`}>
                          <StatusIcon className="text-[10px]" />
                          {statusKey.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-muted text-[11px] font-mono">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
