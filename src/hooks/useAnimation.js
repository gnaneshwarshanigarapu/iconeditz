import { useScroll } from 'framer-motion'
import { useEffect, useState } from 'react'

export const useScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setProgress(latest)
    })
    return unsubscribe
  }, [scrollYProgress])

  return progress
}

export const useInView = (ref, options = {}) => {
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1, ...options })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, options])

  return isInView
}
