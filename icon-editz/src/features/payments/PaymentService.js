/** @typedef {import('./paymentTypes').PaymentOrder} PaymentOrder */
/** @typedef {import('./paymentTypes').PaymentResult} PaymentResult */

/** Payment fallback used until a configured provider is selected. */
export class MockPaymentService {
  /** @param {PaymentOrder} order @returns {Promise<PaymentResult>} */
  async createOrder(order) {
    return { status: 'disabled', message: 'Payments coming soon', orderId: `mock_${Date.now()}_${order.id}` }
  }

  /** @returns {Promise<PaymentResult>} */
  async confirmPayment() { return { status: 'disabled', message: 'Payments coming soon' } }
}

/** @returns {MockPaymentService} */
export function createPaymentService() {
  return new MockPaymentService()
}
