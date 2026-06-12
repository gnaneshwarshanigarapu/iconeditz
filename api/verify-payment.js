import crypto from 'crypto';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY // Use service role key if modifying protected data, but for this anon/service key based on your RLS
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId, // Supabase order UUID
    customerEmail,
    customerName,
    productName,
    downloadLink
  } = req.body;

  try {
    // 1. Verify Razorpay Signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // 2. Mark order as PAID in Supabase
    // If you need admin privileges, use SUPABASE_SERVICE_ROLE_KEY
    const { error: dbError } = await supabase
      .from('orders')
      .update({ payment_status: 'PAID' })
      .eq('id', orderId);

    if (dbError) {
      console.error('Supabase update error:', dbError);
      // Still proceed to send email, maybe? We should ideally ensure DB updates.
    }

    // 3. Send Email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Icon Editz <no-reply@icon-editz.com>', // Replace with verified domain later
      to: [customerEmail],
      subject: `Your Download Link for ${productName} - Icon Editz`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6a0dad;">Thank You for Your Purchase!</h2>
          <p>Hi ${customerName},</p>
          <p>Your payment for <strong>${productName}</strong> was successful.</p>
          <p>Order ID: ${razorpay_order_id}</p>
          <div style="margin: 30px 0;">
            <a href="${downloadLink}" style="background-color: #6a0dad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Your Asset</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${downloadLink}">${downloadLink}</a></p>
          <br/>
          <p>Need help? Contact us at support@icon-editz.com</p>
          <p>Best Regards,<br/>Icon Editz Team</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend email error:', emailError);
      return res.status(500).json({ message: 'Payment verified, but email failed to send', emailError });
    }

    res.status(200).json({ message: 'Payment verified successfully', success: true });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: error.message || 'Verification failed' });
  }
}
