// Payment-related TypeScript types
export type PaymentProviderName = 'disabled' | 'razorpay' | 'stripe'

export interface PaymentOrder {
  id: string
  amount: number
  currency?: string
  productId?: string
  productTitle?: string
}

export interface PaymentResult {
  status: 'disabled' | 'pending' | 'success' | 'failed'
  message?: string
  orderId?: string
}

export interface IPaymentService {
  createOrder(order: PaymentOrder): Promise<PaymentResult>
  confirmPayment?(payload: any): Promise<PaymentResult>
}
