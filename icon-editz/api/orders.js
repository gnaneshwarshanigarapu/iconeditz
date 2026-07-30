import { z } from 'zod';
import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { authenticate } from './lib/auth.js';
import { withApi } from './lib/handler.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Resend } from 'resend';
import { generateDownloadLink } from './lib/r2.js';

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
    orderId: z.string(), // This is our Supabase order UUID
});

async function handleGetOrders(req, res) {
    const user = authenticate(req);
    let query = supabaseAdmin.from('orders').select('*, products(*)').order('created_at', { ascending: false });

    if (user.role !== 'admin') {
        if (!user.sub) throw Object.assign(new Error('Invalid user identity'), { status: 401 });
        query = query.eq('user_id', user.sub);
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ data: data ?? [] });
}

async function handlePostOrders(req, res) {
    const user = authenticate(req);
    if (!user.sub) throw Object.assign(new Error('Authentication required for this action'), { status: 401 });

    const { action, ...body } = req.body;

    switch (action) {
        case 'create-db-order': {
            const orderData = orderSchema.parse(body);
            const { data, error } = await supabaseAdmin
                .from('orders')
                .insert({ ...orderData, payment_status: 'pending', user_id: user.sub })
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
            return await verifyPayment(req, res, user, body);
        }

        default:
            throw Object.assign(new Error('Invalid order action'), { status: 400 });
    }
}

async function verifyPayment(req, res, user, body) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = verifyPaymentSchema.parse(body);

    // 1. Verify Razorpay signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(sign).digest('hex');
    if (razorpay_signature !== expectedSign) {
        throw Object.assign(new Error('Invalid payment signature'), { status: 400 });
    }

    // 2. Fetch order, product, and perform authorization
    const { data: order, error: fetchError } = await supabaseAdmin.from('orders').select('*, products(*)').eq('id', orderId).single();
    if (fetchError || !order) throw Object.assign(new Error('Order not found'), { status: 404 });
    if (user.role !== 'admin' && order.user_id !== user.sub) throw Object.assign(new Error('Not authorized to verify this order'), { status: 403 });

    // 3. Verify payment details with Razorpay API (server-to-server)
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    if (paymentDetails.order_id !== razorpay_order_id) throw Object.assign(new Error('Payment does not match order'), { status: 400 });
    if (paymentDetails.amount / 100 !== order.amount || paymentDetails.currency !== 'INR') throw Object.assign(new Error('Payment amount or currency mismatch'), { status: 400 });
    if (paymentDetails.status !== 'captured') throw Object.assign(new Error('Payment not successful'), { status: 400 });

    // 4. Update DB order status
    const { error: dbError } = await supabaseAdmin.from('orders').update({ payment_status: 'PAID', razorpay_payment_id }).eq('id', orderId);
    if (dbError) {
        console.error('Supabase update error:', dbError);
        throw Object.assign(new Error('Failed to update order status'), { status: 500 });
    }
    
    // 5. Generate secure download link
    const downloadLink = await generateDownloadLink(order.product_id, user.sub);
    
    // 6. Send confirmation email
    try {
        await resend.emails.send({
            from: 'Icon Editz <no-reply@icon-editz.com>',
            to: [order.customer_email],
            subject: `Your Download Link for ${order.products.name} - Icon Editz`,
            html: `Thank you for your purchase, ${order.customer_name}! You can download your file here: <a href="${downloadLink}">${downloadLink}</a>`,
        });
    } catch (emailError) {
        console.error('Resend email error:', emailError);
        // Do not fail the request if email sending fails. Log it and move on.
    }

    return res.status(200).json({ message: 'Payment verified successfully', success: true });
}

export default withApi({
    GET: handleGetOrders,
    POST: handlePostOrders,
});
