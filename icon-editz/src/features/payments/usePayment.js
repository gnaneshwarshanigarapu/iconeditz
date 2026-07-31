import { useCallback } from 'react'
import { usePaymentContext } from './PaymentProvider'

/** Payment actions exposed to React components. */
export function usePayment() {
  const { service } = usePaymentContext()
  const createOrder = useCallback(async (order) => {
    const result = await service.createOrder(order)
    if (result.status === 'disabled' && typeof window !== 'undefined') window.alert('Payments coming soon')
    return result
  }, [service])
  return { createOrder }
}

export default usePayment
