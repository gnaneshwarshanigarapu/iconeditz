import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Tools from '../components/Tools'
import Contact from '../components/Contact'
import Showreel from '../components/Showreel'
import Services from '../components/Services'
import Testimonials from '../components/Testimonials'
import FAQ from '../components/FAQ'

export default function Home() {
  return (
    <div className="relative">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(157,92,255,0.18),transparent_30%),radial-gradient(circle_at_center_right,_rgba(179,136,255,0.12),transparent_35%)]" />
      <div className="purple-grid fixed inset-0 z-0 pointer-events-none opacity-15" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-background/40 via-background/10 to-background" />
      <div className="relative z-10">
        <Hero />
        <Showreel />
        <About />
        <Services />
        <Projects />
        <Tools />
        <Testimonials />
        <FAQ />
        <Contact />
      </div>
    </div>
  )
}
