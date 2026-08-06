// Production Performance Monitoring Utility for Web Vitals & Timings
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || !('performance' in window)) return

  try {
    // 1. Log First Contentful Paint (FCP) and LCP
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          console.info(`⚡ [Performance] First Contentful Paint (FCP): ${Math.round(entry.startTime)}ms`)
        } else if (entry.entryType === 'largest-contentful-paint') {
          console.info(`⚡ [Performance] Largest Contentful Paint (LCP): ${Math.round(entry.startTime)}ms`)
        }
      }
    })

    observer.observe({ type: 'paint', buffered: true })
    observer.observe({ type: 'largest-contentful-paint', buffered: true })

    // 2. Measure TBT / TTI estimate when page load settles
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0]
        if (navTiming) {
          const domInteractive = Math.round(navTiming.domInteractive)
          const loadComplete = Math.round(navTiming.loadEventEnd)
          console.info(`⚡ [Performance] Time to Interactive (TTI Est): ${domInteractive}ms`)
          console.info(`⚡ [Performance] Total Load Duration: ${loadComplete}ms`)
        }
      }, 0)
    })
  } catch (err) {
    console.debug('PerformanceObserver not supported or restricted', err)
  }
}
