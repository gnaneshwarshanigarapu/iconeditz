import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCreateOrder } from '../../hooks/mutations/useCreateOrder'
import { useVerifyPayment } from '../../hooks/mutations/useVerifyPayment'
import { commerceData, metaEvent } from '../../lib/metaPixel'
import { trackGaCommerce } from '../../utils/tracking'
import { api } from '../../services/api'

export default function CheckoutModal({ product, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [purchase, setPurchase] = useState(null)
  const createOrder = useCreateOrder()
  const verifyPayment = useVerifyPayment()

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
    setStatusMessage('Initiating payment...');
    setStatusType('info');
    setLoading(true);

    try {
      if (!window.Razorpay) throw new Error('Razorpay Checkout could not be loaded. Please refresh and try again.')

      const razorpayOrder = await createOrder.mutateAsync({ productId: product.id, name: formData.name, email: formData.email, phone: formData.phone })
      metaEvent('InitiateCheckout', commerceData(product)); trackGaCommerce('begin_checkout', product)
      if (!razorpayOrder.key_id || !razorpayOrder.order_id || !razorpayOrder.amount || !razorpayOrder.currency) throw new Error('The payment service returned an incomplete order.')

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
              setStatusMessage(verifyData.emailSent ? `A download link has been sent to ${formData.email}` : 'Payment successful. Download your file below.')
              setStatusType('success');
            } else {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }
          } catch (err) {
            reportFailedAttempt(razorpayOrder.order_id, { code: 'VERIFICATION_FAILED', description: err.message })
            setStatusMessage(err.message || 'Payment service is temporarily unavailable. Please try again in a few minutes.');
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
            setStatusMessage('Payment cancelled or timed out.');
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
      setStatusMessage(err.message || 'Payment service is temporarily unavailable. Please try again in a few minutes.');
      setStatusType('error');
      setLoading(false);
    }
  };

  const handleDownloadClick = async () => {
    if (!purchase?.orderId) return
    try {
      setStatusMessage('Fetching secure download link...')
      setStatusType('info')
      const res = await api.get(`/api/downloads?orderId=${purchase.orderId}`)
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank')
        setStatusMessage('Download initiated!')
        setStatusType('success')
      } else if (purchase.downloadUrl) {
        window.open(purchase.downloadUrl, '_blank')
        setStatusMessage('Download initiated!')
        setStatusType('success')
      } else {
        throw new Error('Download URL generation failed.')
      }
    } catch (err) {
      if (purchase?.downloadUrl) {
        window.open(purchase.downloadUrl, '_blank')
      } else {
        setStatusMessage(err.message || 'Download link unavailable. Please contact support@iconeditz.com.')
        setStatusType('error')
      }
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
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-6">
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

          {statusMessage && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${
              statusType === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 
              statusType === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 
              'bg-blue-500/20 text-blue-200 border border-blue-500/50'
            }`}>
              {statusMessage}
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

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl mt-6 transition-colors disabled:opacity-50 shadow-lg">
                {loading ? 'Processing...' : `Pay Rs. ${amount}`}
              </button>
            </form>
          )}

          {statusType === 'success' && purchase && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-green-100 space-y-1.5">
                <h3 className="text-xl font-bold text-green-400">✔ Payment Successful</h3>
                <p className="pt-1">Order ID: <code className="text-xs bg-black/40 px-2 py-0.5 rounded text-green-200">{purchase.orderId}</code></p>
                <p>Product: <strong>{purchase.product || product.title}</strong></p>
                <p>Amount Paid: <strong>₹{purchase.amount ?? amount}</strong></p>
                <div className="pt-2 text-xs">
                  {purchase.emailSent || purchase.emailStatus === 'sent' ? (
                    <span className="text-emerald-300 font-semibold">✉ Delivery email sent to {formData.email}</span>
                  ) : (
                    <span className="text-amber-300">⚠️ Email notice: {purchase.emailStatus || 'Email delivery in progress'}</span>
                  )}
                </div>
              </div>

              {purchase.downloadUrl ? (
                <button 
                  onClick={handleDownloadClick} 
                  className="block w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-center font-bold text-white shadow-xl transition-all"
                >
                  ⬇ Download Now
                </button>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-xs">
                  ⚠️ Your payment is confirmed. Download link is temporarily unavailable. Please contact support@iconeditz.com with your Order ID.
                </div>
              )}

              <button onClick={onClose} className="w-full rounded-xl border border-white/10 bg-surface-dark py-3 font-medium text-white transition-colors hover:bg-white/10">
                🏠 Back to Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
