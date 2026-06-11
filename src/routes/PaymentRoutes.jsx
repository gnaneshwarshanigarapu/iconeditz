import React from 'react'
import FutureRoute from '../components/FutureRoute'
import { isEnabled } from '../constants/features'

export default function PaymentRoutes() {
  if (!isEnabled('payments')) return <FutureRoute title="Payments" />

  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="container-custom">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="mt-4 text-text-muted">Payment integrations are configured here.</p>
      </div>
    </section>
  )
}
