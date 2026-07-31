import React, { createContext, useContext, useMemo } from 'react'
import { createPaymentService } from './PaymentService'

const PaymentContext = createContext(null)

export function PaymentProvider({ children }) {
  const service = useMemo(() => createPaymentService(), [])
  return <PaymentContext.Provider value={{ service }}>{children}</PaymentContext.Provider>
}

export function usePaymentContext() {
  const context = useContext(PaymentContext)
  if (!context) throw new Error('usePaymentContext must be used within PaymentProvider')
  return context
}

export default PaymentProvider
