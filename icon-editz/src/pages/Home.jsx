import React from 'react'
import PremiumHomepage from '../components/PremiumHomepage'
import Seo from '../components/Seo'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#05020a]">
      <Seo title="Home" description="Premium video editing, motion graphics, and creative storytelling by Icon Editz." canonicalPath="/" />
      <PremiumHomepage />
    </div>
  )
}
