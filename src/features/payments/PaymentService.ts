import { IPaymentService, PaymentOrder, PaymentResult } from './paymentTypes'

// Mock payment service implementing IPaymentService
export class MockPaymentService implements IPaymentService {
  async createOrder(order: PaymentOrder): Promise<PaymentResult> {
    // No real payment processing - return disabled message
    return {
      status: 'disabled',
      message: 'Payments coming soon',
      orderId: `mock_${Date.now()}`,
    }
  }

  async confirmPayment(_payload: any): Promise<PaymentResult> {
    return { status: 'disabled', message: 'Payments coming soon' }
  }
}

// Factory to choose service based on env
export function createPaymentService(): IPaymentService {
  const provider = (import.meta.env.PAYMENT_PROVIDER || 'disabled').toLowerCase()
  // Keep placeholder: do not import any real SDKs here
  switch (provider) {
    default:
      return new MockPaymentService()
  }
}
