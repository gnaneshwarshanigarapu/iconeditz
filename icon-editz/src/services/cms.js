import { useMemo } from 'react'
import { api } from './api'
import { useCMS } from '../hooks/useCMS'

export const getCms = async ({ page, section, slug } = {}) => {
  const params = new URLSearchParams()
  if (page) params.set('page', page)
  if (section) params.set('section', section)
  if (slug) params.set('slug', slug)
  return (await api.get(`/api/cms?${params}`)).data ?? {}
}

const normalizeCmsContent = (value) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value ?? {}
}

export const rowsToSections = (rows) => Object.fromEntries((Array.isArray(rows) ? rows : []).map((row) => [row.section, normalizeCmsContent(row.content)]))

export const useCmsPage = (page) => {
  const query = useCMS({ page })
  const content = useMemo(() => rowsToSections(query.data), [query.data])
  return { content, loading: query.isLoading, error: query.error, refetch: query.refetch }
}

export const useCmsSingleton = (section) => {
  const query = useCMS({ section })
  return query.data || {}
}
