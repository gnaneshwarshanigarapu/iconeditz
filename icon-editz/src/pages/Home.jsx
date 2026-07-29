import React from 'react'
import PremiumHomepage from '../components/PremiumHomepage'
import Seo from '../components/Seo'
import { organization, website } from '../utils/schema'

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#05020a]">
      <Seo 
        title="Icon Editz - Premium Video Editing & Motion Graphics" 
        description="Premium video editing, motion graphics, and creative storytelling by Icon Editz. We bring your vision to life." 
        canonical="https://iconeditz.com/"
        schema={[organization, website]}
      />
      <PremiumHomepage />
    </div>
  )
}
