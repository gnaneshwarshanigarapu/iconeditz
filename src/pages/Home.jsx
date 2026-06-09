import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Tools from '../components/Tools'
import Contact from '../components/Contact'
import BackgroundScene from '../three/BackgroundScene'

export default function Home() {
  return (
    <div className="relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundScene scrollReactive />
      </div>
      <div className="purple-grid fixed inset-0 z-0 pointer-events-none opacity-35" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-background/40 via-background/10 to-background" />
      <div className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Tools />
        <Contact />
      </div>
    </div>
  )
}
