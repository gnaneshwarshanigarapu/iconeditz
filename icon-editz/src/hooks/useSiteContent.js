import { useEffect, useMemo, useState } from 'react'
import { defaultSiteContent } from '../data/defaultSiteContent'

const STORAGE_KEY = 'icon-editz-site-content'

const parseStoredContent = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    return JSON.parse(stored)
  } catch (error) {
    console.warn('Unable to parse site content storage', error)
    return null
  }
}

export const useSiteContent = () => {
  const [content, setContent] = useState(defaultSiteContent)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const storedContent = parseStoredContent()
    if (storedContent) {
      setContent(storedContent)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  }, [content, isHydrated])

  const updateSection = (section, updater) => {
    setContent((current) => ({
      ...current,
      [section]: typeof updater === 'function' ? updater(current[section]) : updater,
    }))
  }

  const resetContent = () => {
    setContent(defaultSiteContent)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  return useMemo(
    () => ({
      content,
      isHydrated,
      updateSection,
      resetContent,
      setContent,
    }),
    [content, isHydrated],
  )
}
