import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function CheckoutModal({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      // 1. Create order in our backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          receipt: `rcpt_${Date.now()}`
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      // 2. Determine download link (priority: zip -> google -> onedrive -> dropbox)
      const downloadLink = product.zip_path || product.google_drive_link || product.onedrive_link || product.dropbox_link;

      // 3. Create Order record in Supabase
      const { data: dbOrder, error: dbError } = await supabase
        .from('orders')
        .insert({
          order_id: data.id,
          product_id: product.id,
          product_name: product.title,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          amount: amount,
          payment_status: 'pending',
          download_link: downloadLink
        })
        .select()
        .single();

      if (dbError) throw new Error('Database Error: ' + dbError.message);

      // 4. Setup Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use correct env variable
        amount: data.amount,
        currency: data.currency,
        name: 'Icon Editz',
        description: `Purchase of ${product.title}`,
        order_id: data.id,
        handler: async function (response) {
          try {
            setStatusMessage('Verifying payment and sending email...');
            setStatusType('info');
            
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrder.id,
                customerEmail: formData.email,
                customerName: formData.name,
                productName: product.title,
                downloadLink: downloadLink
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              setStatusMessage('Payment successful! Check your email for the download link.');
              setStatusType('success');
            } else {
              setStatusMessage('Payment verified, but email failed. Contact support.');
              setStatusType('error');
            }
          } catch (err) {
            console.error(err);
            setStatusMessage('Error verifying payment. Contact support.');
            setStatusType('error');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#9D5CFF' // primary color
        }
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response){
        setStatusMessage(`Payment Failed: ${response.error.description}`);
        setStatusType('error');
      });

      rzp1.open();
      setStatusMessage(''); // Clear loading text when opened
      setLoading(false);

    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || 'An error occurred.');
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
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
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
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Email Address *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Mobile Number *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                  className="w-full bg-surface-dark border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="9876543210"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl mt-6 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay Rs. ${amount}`}
              </button>
            </form>
          )}

          {statusType === 'success' && (
            <button 
              onClick={onClose}
              className="w-full bg-surface-dark hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl mt-4 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
