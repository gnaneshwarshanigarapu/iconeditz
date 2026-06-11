import { useCallback } from 'react'
import { usePaymentContext } from './PaymentProvider'
import type { PaymentOrder, PaymentResult } from './paymentTypes'

export function usePayment() {
  const { service } = usePaymentContext()

  const createOrder = useCallback(async (order: PaymentOrder): Promise<PaymentResult> => {
    const res = await service.createOrder(order)
    if (res.status === 'disabled') {
      // UX: show fallback message
      if (typeof window !== 'undefined') window.alert('Payments coming soon')
    }
    return res
  }, [service])

  return { createOrder }
}

export default usePayment
