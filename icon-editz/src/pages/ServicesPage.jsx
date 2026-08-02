import React from 'react'
import Services from '../components/Services'
import Seo from '../components/Seo'

export default function ServicesPage() {
  return (
    <>
      <Seo title="Services" description="Explore premium video editing, motion graphics, and creative services from Icon Editz." canonicalPath="/services" />
      <Services />
    </>
  )
}
