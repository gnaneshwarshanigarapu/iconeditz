// Custom hooks for common functionality

import { useEffect, useState } from 'react'
import { api, getToken } from '../utils/api'
import { useUserStore } from '../utils/store'

// ==========================================
// useApi - Fetch data from API
// ==========================================

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Implementation depends on your API structure
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
          ...options,
        })
        if (!response.ok) throw new Error('API request failed')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint])

  return { data, loading, error }
}

// ==========================================
// usePagination - Pagination logic
// ==========================================

export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  }
}

// ==========================================
// useSearch - Search functionality
// ==========================================

export const useSearch = (items, searchFields = []) => {
  const [searchQuery, setSearchQuery] = useState('')

  const results = items.filter((item) =>
    searchFields.some((field) =>
      String(item[field]).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return {
    searchQuery,
    setSearchQuery,
    results,
  }
}

// ==========================================
// useLocalStorage - Persist state to localStorage
// ==========================================

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error setting localStorage:', error)
    }
  }

  return [storedValue, setValue]
}

// ==========================================
// useWindowSize - Get window dimensions
// ==========================================

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// ==========================================
// useDebounce - Debounce values
// ==========================================

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// ==========================================
// usePrevious - Get previous value
// ==========================================

export const usePrevious = (value) => {
  const ref = React.useRef()

  React.useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// ==========================================
// useMounted - Check if component is mounted
// ==========================================

export const useMounted = () => {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

// ==========================================
// useAuth - Authentication hook (uses Zustand store)
// ==========================================

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email, password) => {
    setIsLoading(true)
    try {
      // Implement login logic using api.auth.login()
      const userData = await api.auth.login(email, password)
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    setIsLoading(true)
    try {
      // Implement register logic using api.auth.register()
      const newUser = await api.auth.register(userData)
      setUser(newUser)
      return newUser
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    api.auth.logout()
    logout()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
  }
}

// ==========================================
// useFetch - Advanced fetch hook
// ==========================================

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
          ...options,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        if (isMounted) {
          setData(result)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setData(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [url])

  return { data, loading, error }
}
