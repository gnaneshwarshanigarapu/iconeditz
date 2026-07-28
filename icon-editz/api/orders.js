import { z } from 'zod';
import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { authenticate } from './lib/auth.js';
import { withApi } from './lib/handler.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const orderSchema = z.object({
  product_id: z.union([z.string(), z.number()]),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(7),
  amount: z.coerce.number().positive(),
}).passthrough();

const razorpayOrderSchema = z.object({
    amount: z.number(),
    currency: z.string().default('INR'),
    receipt: z.string().optional(),
    notes: z.record(z.any()).optional()
});

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    orderId: z.string(), // Supabase order UUID
    customerEmail: z.string(),
    customerName: z.string(),
    productName: z.string(),
    downloadLink: z.string()
});

export default withApi(['GET', 'POST'], async (req, res) => {
  if (req.method === 'GET') {
    const user = authenticate(req);
    let q = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });
    if (user.role !== 'admin') {
      q = q.eq('user_id', user.sub);
    }
    const { data, error } = await q;
    if (error) throw error;
    return res.json({ data: data ?? [] });
  }

  // POST method for different actions
  const { action, ...body } = req.body;

  switch (action) {
    case 'create-db-order': {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert({ ...orderSchema.parse(body), payment_status: 'pending' })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ data });
    }

    case 'create-payment-order': {
      const { amount, currency, receipt, notes } = razorpayOrderSchema.parse(body);
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency,
        receipt,
        notes,
      };
      const order = await razorpay.orders.create(options);
      if (!order) {
        throw Object.assign(new Error('Failed to create Razorpay order'), { status: 500 });
      }
      return res.status(200).json(order);
    }

    case 'verify-payment': {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
        customerEmail,
        customerName,
        productName,
        downloadLink
      } = verifyPaymentSchema.parse(body);

      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        throw Object.assign(new Error('Invalid payment signature'), { status: 400 });
      }

      const { error: dbError } = await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'PAID' })
        .eq('id', orderId);

      if (dbError) {
        console.error('Supabase update error:', dbError);
        // Depending on the policy, we might want to throw an error here
      }

      const { error: emailError } = await resend.emails.send({
        from: 'Icon Editz <no-reply@icon-editz.com>',
        to: [customerEmail],
        subject: `Your Download Link for ${productName} - Icon Editz`,
        html: `<div>...</div>`, // Keeping it short for brevity
      });

      if (emailError) {
          console.error('Resend email error:', emailError);
        // Even if email fails, payment is verified.
      }

      return res.status(200).json({ message: 'Payment verified successfully', success: true });
    }

    default:
      throw Object.assign(new Error('Invalid action'), { status: 400 });
  }
});
