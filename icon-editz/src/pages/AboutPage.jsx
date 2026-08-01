import React from 'react'
import About from '../components/About'
import Seo from '../components/Seo'
import CmsPageContent from '../components/CmsPageContent'

export default function AboutPage() {
  return (
    <>
      <Seo title="About" description="Learn more about Icon Editz, the creative studio behind premium editing and motion graphics." canonicalPath="/about" />
      <CmsPageContent page="About Page" fallbackTitle="About Icon Editz" fallbackDescription="Learn more about our creative studio." />
      <About />
    </>
  )
}
