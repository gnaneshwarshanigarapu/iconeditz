import React from 'react'

export default function FutureRoute({ title }) {
  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="container-custom">
        <p className="section-kicker">Future page</p>
        <h1 className="mt-4 text-4xl font-bold text-gradient">{title}</h1>
        <p className="mt-4 max-w-2xl text-text-muted">
          This route is reserved in the architecture so Icon Editz can grow into a full digital
          products platform.
        </p>
      </div>
    </section>
  )
}
