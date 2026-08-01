import React from 'react'
import Services from '../components/Services'
import Seo from '../components/Seo'
import CmsPageContent from '../components/CmsPageContent'

export default function ServicesPage() {
  return (
    <>
      <Seo title="Services" description="Explore premium video editing, motion graphics, and creative services from Icon Editz." canonicalPath="/services" />
      <CmsPageContent page="Services Page" fallbackTitle="Services" fallbackDescription="Creative support for every big idea." />
      <Services />
    </>
  )
}
