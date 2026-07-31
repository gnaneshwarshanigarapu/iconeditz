/**
 * @typedef {'disabled'|'razorpay'|'stripe'} PaymentProviderName
 * @typedef {{ id: string, amount: number, currency?: string, productId?: string, productTitle?: string }} PaymentOrder
 * @typedef {{ status: 'disabled'|'pending'|'success'|'failed', message?: string, orderId?: string }} PaymentResult
 * @typedef {{ createOrder: (order: PaymentOrder) => Promise<PaymentResult>, confirmPayment?: (payload: unknown) => Promise<PaymentResult> }} PaymentService
 */

export {}
