import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth'; // Assuming you have a useAuth hook
import { getToken } from '../../utils/api'

async function readApiResponse(response, request) {
  const text = await response.text()
  const headers = Object.fromEntries(response.headers.entries())
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = {}
    }
  }

  if (import.meta.env.DEV) {
    console.debug('[Checkout API]', {
      url: request.url,
      method: request.method,
      body: request.body,
      status: response.status,
      headers,
      text,
      data,
    })
  }

  if (!response.ok) throw new Error(data.error?.message || data.message || text || `Server error (${response.status})`)
  return data
}

export default function CheckoutModal({ product, onClose }) {
  const { user } = useAuth(); // Get authenticated user
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'error', 'success', 'info'

  const amount = product.discountPrice || product.price;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpay = async () => {
    setStatusMessage('Initiating payment...');
    setStatusType('info');
    setLoading(true);

    try {
      const accessToken = await getToken()
      if (!accessToken) throw new Error('Your session has expired. Please sign in again.')
      const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) throw new Error('Payments are not configured. Please contact support.')
      if (!window.Razorpay) throw new Error('Razorpay Checkout could not be loaded. Please refresh and try again.')

      // The server calculates the product price and creates both the local and Razorpay orders.
      const createOrderRequest = {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          product_id: product.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
        }),
      }
      const razorpayOrderResponse = await fetch('/api/orders', createOrderRequest)
      
      const razorpayOrder = await readApiResponse(razorpayOrderResponse, { url: '/api/orders', ...createOrderRequest })
      if (!razorpayOrder.order_id || !razorpayOrder.amount || !razorpayOrder.currency) throw new Error('The payment service returned an incomplete order.')

      // Step 3: Setup Razorpay options and open the modal
      let paymentReceived = false;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Icon Editz',
        description: `Purchase of ${product.title}`,
        order_id: razorpayOrder.order_id,
        handler: async function (response) {
          paymentReceived = true;
          setStatusMessage('Verifying payment...');
          try {
            const verifyRequest = {
              method: 'PUT',
              headers: authHeaders,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            }
            const verifyRes = await fetch('/api/orders', verifyRequest)

            const verifyData = await readApiResponse(verifyRes, { url: '/api/orders', ...verifyRequest })
            if (verifyData.success) {
              setStatusMessage('Payment successful! Check your email for the download link.');
              setStatusType('success');
            } else {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }
          } catch (err) {
            console.error(err);
            setStatusMessage(err.message || 'Error verifying payment. Please contact support.');
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
            setStatusMessage('Payment cancelled. Your order has not been charged.');
            setStatusType('info');
          },
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        setStatusMessage(`Payment Failed: ${response.error.description}`);
        setStatusType('error');
        setLoading(false);
      });

      rzp1.open();
      setLoading(false);
      setStatusMessage(''); // Clear loading text when Razorpay modal opens

    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || 'An unexpected error occurred.');
      setStatusType('error');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setStatusMessage('Please fill all fields');
      setStatusType('error');
      return;
    }
    if (!user) {
        setStatusMessage('You must be logged in to make a purchase.');
        setStatusType('error');
        // Here you might want to trigger a login modal
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
          {/* Close Icon */}
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Guest Checkout</h2>
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

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl mt-6 transition-colors disabled:opacity-50">
                {loading ? 'Processing...' : `Pay Rs. ${amount}`}
              </button>
            </form>
          )}

          {statusType === 'success' && (
            <button onClick={onClose} className="w-full bg-surface-dark hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl mt-4 transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
