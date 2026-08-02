import React from 'react'
import About from '../components/About'
import Seo from '../components/Seo'

export default function AboutPage() {
  return (
    <>
      <Seo title="About" description="Learn more about Icon Editz, the creative studio behind premium editing and motion graphics." canonicalPath="/about" />
      <About />
    </>
  )
}
