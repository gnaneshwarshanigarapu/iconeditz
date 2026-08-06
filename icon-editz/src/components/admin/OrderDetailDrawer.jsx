import React, { useState } from 'react'
import {
  FiX,
  FiUser,
  FiCreditCard,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiPrinter,
  FiBox,
} from 'react-icons/fi'

export default function OrderDetailDrawer({ order, onClose }) {
  const [showJson, setShowJson] = useState(false)

  if (!order) return null

  const isPaid =
    (order.payment_status || order.status || '').toUpperCase() === 'PAID' ||
    (order.payment_status || order.status || '').toUpperCase() === 'SUCCESS' ||
    (order.payment_status || order.status || '').toUpperCase() === 'CAPTURED'

  const items = order.order_items || [
    {
      id: order.id,
      product_name: order.product_name || 'Creative Asset',
      quantity: 1,
      unit_price: Number(order.amount || 0),
      total_price: Number(order.amount || 0),
    },
  ]

  const customerName = order.customer_name || 'Customer'
  const customerEmail = order.customer_email || order.user_email || order.email || ''
  const customerPhone = order.customer_phone || '—'
  const dateStr = order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : 'Recent'

  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#120c24] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">Order Details #{order.id.slice(0, 8)}</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isPaid
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                }`}
              >
                {isPaid ? <FiCheckCircle /> : <FiClock />}
                {isPaid ? 'PAID' : 'PENDING'}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">Purchased on {dateStr}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={printInvoice}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              <FiPrinter /> Print Invoice
            </button>
            <button onClick={onClose} className="p-1.5 text-text-muted hover:text-white">
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Customer & Billing Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          {/* Customer Info */}
          <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FiUser className="text-primary" /> Customer Profile
            </div>
            <p className="font-bold text-white text-sm">{customerName}</p>
            <p className="text-text-muted">Email: <span className="text-white">{customerEmail}</span></p>
            <p className="text-text-muted">Phone: <span className="text-white font-mono">{customerPhone}</span></p>
          </div>

          {/* Billing Summary */}
          <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FiCreditCard className="text-emerald-400" /> Gateway & Billing
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Total Paid:</span>
              <span className="font-extrabold text-emerald-400 text-base">₹{order.amount || order.total_amount || 0}</span>
            </div>
            <p className="text-text-muted">Method: <span className="text-white font-semibold">{order.payment_method || 'Razorpay UPI'}</span></p>
            <p className="text-text-muted">Razorpay Order ID: <span className="text-white font-mono">{order.razorpay_order_id || 'N/A'}</span></p>
            <p className="text-text-muted">Razorpay Payment ID: <span className="text-white font-mono">{order.razorpay_payment_id || 'N/A'}</span></p>
          </div>
        </div>

        {/* Purchased Products Table (Normalized Order Items) */}
        <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FiBox className="text-indigo-400" /> Purchased Products ({items.length} item{items.length > 1 ? 's' : ''})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase text-[10px]">
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3">Quantity</th>
                  <th className="py-2 px-3">Unit Price</th>
                  <th className="py-2 px-3">Total Price</th>
                  <th className="py-2 px-3 text-right">Download Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {item.products?.title || item.product_name || 'Creative Asset'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-text-muted">{item.quantity || 1}</td>
                    <td className="py-2.5 px-3 text-text-muted">₹{item.unit_price || item.total_price || order.amount}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">₹{item.total_price || order.amount}</td>
                    <td className="py-2.5 px-3 text-right">
                      {isPaid ? (
                        <a
                          href={order.download_link || item.products?.zip_path || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/20 border border-primary/30 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/30"
                        >
                          <FiDownload /> Download ZIP
                        </a>
                      ) : (
                        <span className="text-[11px] text-amber-300 font-mono">Payment Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline of Payment Events */}
        <div className="rounded-xl bg-white/[0.03] p-4 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FiClock className="text-cyan-400" /> Payment & Delivery Event Timeline
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white font-semibold">Order Created:</span>
              <span className="text-text-muted">{dateStr}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-white font-semibold">Payment Status:</span>
              <span className={isPaid ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                {isPaid ? 'Payment Captured (PAID)' : 'Checkout Initiated / Pending'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-white/20'}`} />
              <span className="text-white font-semibold">Asset Delivery Email:</span>
              <span className="text-text-muted">{isPaid ? `Delivered to ${customerEmail}` : 'Awaiting Payment'}</span>
            </div>
          </div>
        </div>

        {/* Accordion Raw Gateway Response Payload */}
        <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <button
            onClick={() => setShowJson(!showJson)}
            className="w-full flex items-center justify-between p-4 text-xs font-bold text-white hover:bg-white/5"
          >
            <span>Inspect Gateway Payload & Response</span>
            {showJson ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {showJson && (
            <div className="p-4 bg-black/40 border-t border-white/5 font-mono text-[11px] text-emerald-300 max-h-48 overflow-y-auto">
              <pre>{JSON.stringify(order, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
