import { getToken } from '../utils/api'

const timeoutMs = 15_000

export class ApiError extends Error {
  constructor(message, { status, code, payload } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

export async function apiRequest(endpoint, options = {}) {
  const { body, token, timeout = timeoutMs, headers: suppliedHeaders, ...rest } = options
  const authToken = token === null ? null : token || await getToken()
  const headers = { ...suppliedHeaders }
  if (authToken) headers.Authorization = `Bearer ${authToken}`
  let requestBody = body
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] ??= 'application/json'
    requestBody = JSON.stringify(body)
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  let response
  try {
    response = await fetch(endpoint, { ...rest, headers, body: requestBody, signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('The request timed out. Please try again.', { status: 408 })
    throw error
  } finally {
    clearTimeout(timer)
  }
  if (response.status === 204) return undefined
  const text = await response.text()
  let payload = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = { message: text } }
  if (!response.ok) throw new ApiError(payload.error?.message || payload.error || payload.message || `Request failed (${response.status})`, { status: response.status, code: payload.code || payload.error?.code, payload })
  return payload
}

export const api = { request: apiRequest, get: (url, options) => apiRequest(url, options), post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body }), put: (url, body, options) => apiRequest(url, { ...options, method: 'PUT', body }), patch: (url, body, options) => apiRequest(url, { ...options, method: 'PATCH', body }), delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' }) }
