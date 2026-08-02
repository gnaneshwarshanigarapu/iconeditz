import React, { useEffect } from 'react'
import PremiumHomepage from '../components/PremiumHomepage'
import Seo from '../components/Seo'
import { organization, website } from '../utils/schema'

export default function Home() {
  useEffect(() => {
    const activeElement = document.activeElement
    const isEditable = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement?.isContentEditable

    if (isEditable) activeElement.blur()
  }, [])

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
