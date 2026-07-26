import React, { createContext, useContext, useMemo } from 'react'
import { createPaymentService } from './PaymentService'
import type { IPaymentService } from './paymentTypes'

const PaymentContext = createContext<{ service: IPaymentService } | null>(null)

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const service = useMemo(() => createPaymentService(), [])
  return <PaymentContext.Provider value={{ service }}>{children}</PaymentContext.Provider>
}

export function usePaymentContext() {
  const ctx = useContext(PaymentContext)
  if (!ctx) throw new Error('usePaymentContext must be used within PaymentProvider')
  return ctx
}

export default PaymentProvider
