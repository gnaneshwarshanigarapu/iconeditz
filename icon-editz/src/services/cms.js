import { useEffect, useState } from 'react'

const readJson = async (response) => {
  const text = await response.text()
  let body = {}
  if (text) {
    try { body = JSON.parse(text) } catch { body = {} }
  }
  if (!response.ok) throw new Error(body.error?.message || body.error || body.message || text || `CMS request failed (${response.status})`)
  return body
}

export const getCms = async ({ page, section, slug } = {}) => {
  const params = new URLSearchParams()
  if (page) params.set('page', page)
  if (section) params.set('section', section)
  if (slug) params.set('slug', slug)
  const requested = page || section || slug || 'unknown'
  console.log('CMS REQUEST', requested)
  const data = await readJson(await fetch(`/api/cms?${params.toString()}`))
  console.log('CMS RESPONSE', data.data ?? {})
  return data.data ?? {}
}

export const rowsToSections = (rows) => Object.fromEntries((Array.isArray(rows) ? rows : []).map((row) => [row.section, row.content || {}]))

export const useCmsPage = (page, fallback = {}) => {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    getCms({ page })
      .then((rows) => {
        const sections = rowsToSections(rows)
        const useFallback = Object.keys(sections).length === 0
        console.log('CMS FALLBACK USED', { page, used: useFallback, rows: Array.isArray(rows) ? rows.length : 0 })
        if (active) setData(useFallback ? fallback : sections)
      })
      .catch((error) => {
        console.warn('CMS FALLBACK USED', { page, used: true, reason: error.message })
        if (active) setData(fallback)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [page])
  return { content: data, loading }
}

export const useCmsSingleton = (section, fallback = {}) => {
  const [data, setData] = useState(fallback)
  useEffect(() => {
    let active = true
    getCms({ section })
      .then((content) => {
        const useFallback = !content || Object.keys(content).length === 0
        console.log('CMS FALLBACK USED', { section, used: useFallback })
        if (active) setData(useFallback ? fallback : content)
      })
      .catch((error) => {
        console.warn('CMS FALLBACK USED', { section, used: true, reason: error.message })
        if (active) setData(fallback)
      })
    return () => { active = false }
  }, [section])
  return data
}
