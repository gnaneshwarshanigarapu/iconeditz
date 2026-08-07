import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCreateOrder } from '../../hooks/mutations/useCreateOrder'
import { useVerifyPayment } from '../../hooks/mutations/useVerifyPayment'
import { commerceData, metaEvent } from '../../lib/metaPixel'
import { trackGaCommerce } from '../../utils/tracking'
import { api } from '../../services/api'
import { Loader2, CheckCircle2, Download, Mail } from 'lucide-react'

export const prefetchRazorpayScript = () => {
  if (typeof window === 'undefined' || window.Razorpay) return
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.async = true
  document.head.appendChild(script)
}

export default function CheckoutModal({ product, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [purchase, setPurchase] = useState(null)
  const createOrder = useCreateOrder()
  const verifyPayment = useVerifyPayment()

  useEffect(() => {
    prefetchRazorpayScript()
  }, [])

  const amount = product.discountPrice || product.price;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const reportFailedAttempt = (razorpayOrderId, errDetails) => {
    api.post('/api/payment-attempts', {
      razorpay_order_id: razorpayOrderId,
      amount: amount,
      currency: 'INR',
      status: 'failed',
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      error_code: errDetails?.code || 'BAD_REQUEST_PAYMENT_TIMED_OUT',
      error_description: errDetails?.description || errDetails?.reason || 'Customer - Payment Timed Out',
    }).catch(() => {})
  }

  const loadRazorpay = async () => {
    setStatusMessage('Initializing secure payment...');
    setStatusType('info');
    setLoading(true);

    try {
      if (!window.Razorpay) throw new Error('Razorpay Checkout is initializing. Please try again in a moment.')

      const razorpayOrder = await createOrder.mutateAsync({ productId: product.id, name: formData.name, email: formData.email, phone: formData.phone })
      metaEvent('InitiateCheckout', commerceData(product)); trackGaCommerce('begin_checkout', product)
      if (!razorpayOrder.key_id || !razorpayOrder.order_id || !razorpayOrder.amount || !razorpayOrder.currency) throw new Error('Payment initialization failed.')

      let paymentReceived = false;
      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Icon Editz',
        description: `Purchase of ${product.title}`,
        order_id: razorpayOrder.order_id,
        handler: async function (response) {
          paymentReceived = true;
          setStatusMessage('Verifying payment...');
          try {
            const verifyData = await verifyPayment.mutateAsync({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature })
            if (verifyData.success) {
              setPurchase(verifyData)
              metaEvent('Purchase', commerceData(product), verifyData.eventId)
              trackGaCommerce('purchase', product, verifyData.orderId)
              setStatusMessage('Payment verified! Your download is ready.')
              setStatusType('success');
            } else {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }
          } catch (err) {
            reportFailedAttempt(razorpayOrder.order_id, { code: 'VERIFICATION_FAILED', description: err.message })
            setStatusMessage(err.message || 'Unable to verify payment. Please try again.');
            setStatusType('error');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#9D5CFF'
        },
        modal: {
          ondismiss: () => {
            if (paymentReceived) return;
            setLoading(false);
            reportFailedAttempt(razorpayOrder.order_id, { code: 'BAD_REQUEST_PAYMENT_TIMED_OUT', description: 'Customer - Payment Timed Out' })
            setStatusMessage('Payment cancelled.');
            setStatusType('info');
          },
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        reportFailedAttempt(razorpayOrder.order_id, response?.error || { code: 'BAD_REQUEST_PAYMENT_TIMED_OUT', description: 'Customer - Payment Timed Out' })
        setStatusMessage('Payment could not be completed.');
        setStatusType('error');
        setLoading(false);
      });

      rzp1.open();
      setLoading(false);
      setStatusMessage('');

    } catch (err) {
      setStatusMessage(err.message || 'Payment service is temporarily unavailable.');
      setStatusType('error');
      setLoading(false);
    }
  };

  const hasAttachedFile = Boolean(
    purchase?.downloadUrl ||
    product?.downloadKey ||
    product?.download_key ||
    product?.r2_object_key ||
    product?.downloadUrl ||
    product?.zip_path
  )

  const triggerInPlaceDownload = (url, filename) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename || ''
    link.target = '_self'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleDownloadClick = async () => {
    if (!purchase) return

    console.log('[Download Button Click]', {
      orderId: purchase?.orderId,
      productId: product?.id,
      productTitle: product?.title,
      hasAttachedFile,
      downloadUrl: purchase?.downloadUrl,
    })

    setDownloading(true)

    try {
      let downloadUrl = purchase.downloadUrl

      if (!downloadUrl && purchase.orderId) {
        setStatusMessage('Fetching secure download link...')
        const res = await api.get(`/api/downloads?orderId=${purchase.orderId}`)
        if (res.data?.downloadUrl) {
          downloadUrl = res.data.downloadUrl
        }
      }

      if (downloadUrl) {
        const isExternalCloud =
          downloadUrl.includes('drive.google.com') ||
          downloadUrl.includes('dropbox.com') ||
          downloadUrl.includes('mega.nz') ||
          downloadUrl.includes('onedrive.live.com') ||
          downloadUrl.includes('mediafire.com')

        if (isExternalCloud) {
          console.log('[Download Execution] Google Drive / External Cloud Link detected. Opening in secure window...', downloadUrl)
          window.open(downloadUrl, '_blank')
        } else {
          console.log('[Download Execution] File URL / R2 Signed URL detected. Executing in-place download...', downloadUrl)
          triggerInPlaceDownload(downloadUrl, product.title || 'asset')
        }
        setStatusMessage('Download started!')
        setStatusType('success')
      } else {
        throw new Error('No downloadable file is attached to this asset.')
      }
    } catch (err) {
      setStatusMessage(err.message || 'Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setStatusMessage('Please fill all required fields');
      setStatusType('error');
      return;
    }
    loadRazorpay();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
          disabled={loading || downloading}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-6">
          {statusType !== 'success' && (
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {user ? 'Secure Checkout' : 'Guest Checkout'}
                </h2>
              </div>

              {user && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 border border-violet-500/20 mb-3">
                  🔒 Authenticated as {user.email}
                </div>
              )}

              <p className="text-text-muted text-sm mb-6">You are purchasing <strong className="text-white">{product.title}</strong> for Rs. {amount}</p>
            </>
          )}

          {statusMessage && statusType !== 'success' && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${
              statusType === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 
              'bg-blue-500/20 text-blue-200 border border-blue-500/50'
            }`}>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-violet-400" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {statusType !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Full Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Email Address *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Mobile Number *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} pattern="[0-9]{10}" title="Please enter a valid 10-digit mobile number" className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="9876543210" />
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl mt-6 transition-all disabled:opacity-60 shadow-lg">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Initializing secure payment...</span>
                  </>
                ) : (
                  `Pay Rs. ${amount}`
                )}
              </button>
            </form>
          )}

          {statusType === 'success' && purchase && (
            <div className="space-y-5 text-sm">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xl font-bold">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  <span>Payment Successful</span>
                </div>
                <div className="space-y-2 pt-2 text-sm text-emerald-200/90">
                  <p className="flex justify-between items-center">
                    <span className="text-text-muted">Order ID:</span>
                    <code className="text-xs bg-black/40 px-2 py-0.5 rounded text-emerald-300 font-mono">{purchase.orderId}</code>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-text-muted">Product:</span>
                    <strong className="text-white">{purchase.product || product.title}</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-text-muted">Amount Paid:</span>
                    <strong className="text-white">₹{purchase.amount ?? amount}</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-text-muted">Customer Email:</span>
                    <strong className="text-white font-mono">{purchase.customerEmail || formData.email}</strong>
                  </p>
                </div>
                <div className="pt-3 border-t border-emerald-500/20 text-xs font-medium text-emerald-200 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>A copy of your download link has also been sent to your email.</span>
                </div>
              </div>

              {!hasAttachedFile && !purchase.downloadUrl && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 font-medium text-center">
                  ⚠️ No downloadable file is attached to this asset.
                </div>
              )}

              <div className="space-y-3">
                <button 
                  onClick={handleDownloadClick} 
                  disabled={!hasAttachedFile && !purchase.downloadUrl || downloading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 text-center font-bold text-white shadow-xl shadow-violet-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Download Now</span>
                    </>
                  )}
                </button>
                <button onClick={onClose} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface-dark py-3.5 font-medium text-white transition-colors hover:bg-white/10">
                  🏠 Back to Store
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
