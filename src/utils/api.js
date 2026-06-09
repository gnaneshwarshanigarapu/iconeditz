// API client utilities for future backend integration
// This file handles all API calls to your backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000

// Create request headers
const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Handle API errors
const handleError = (error) => {
  console.error('API Error:', error)
  
  if (error.response?.status === 401) {
    // Handle unauthorized
    localStorage.removeItem('token')
    window.location.href = '/login'
  }
  
  throw error
}

// Main API client
export const api = {
  // Products API
  products: {
    getAll: async (category = null) => {
      try {
        const url = category
          ? `${API_URL}/api/products?category=${category}`
          : `${API_URL}/api/products`
        
        const response = await fetch(url, {
          headers: getHeaders(),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Failed to fetch products')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },

    getById: async (productId) => {
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
          headers: getHeaders(),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Product not found')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },

    search: async (query) => {
      try {
        const response = await fetch(`${API_URL}/api/products/search?q=${query}`, {
          headers: getHeaders(),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Search failed')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },
  },

  // Orders API
  orders: {
    create: async (orderData, token) => {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify(orderData),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Order creation failed')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },

    getAll: async (token) => {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: getHeaders(token),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Failed to fetch orders')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },

    getById: async (orderId, token) => {
      try {
        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: getHeaders(token),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Order not found')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },
  },

  // Authentication API
  auth: {
    login: async (email, password) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ email, password }),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Login failed')
        const data = await response.json()
        localStorage.setItem('token', data.token)
        return data
      } catch (error) {
        handleError(error)
      }
    },

    register: async (userData) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(userData),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Registration failed')
        const data = await response.json()
        localStorage.setItem('token', data.token)
        return data
      } catch (error) {
        handleError(error)
      }
    },

    logout: () => {
      localStorage.removeItem('token')
    },

    getCurrentUser: async (token) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: getHeaders(token),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Failed to fetch user')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },
  },

  // Payment API
  payment: {
    createOrder: async (amount, token) => {
      try {
        const response = await fetch(`${API_URL}/api/payment/create-order`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify({ amount }),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Payment order creation failed')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },

    verifyPayment: async (paymentData, token) => {
      try {
        const response = await fetch(`${API_URL}/api/payment/verify`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify(paymentData),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Payment verification failed')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },
  },

  // Contact API
  contact: {
    send: async (contactData) => {
      try {
        const response = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(contactData),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Failed to send message')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },
  },

  // Blog API (Future)
  blog: {
    getPosts: async () => {
      try {
        const response = await fetch(`${API_URL}/api/blog/posts`, {
          headers: getHeaders(),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Failed to fetch posts')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },

    getPost: async (postId) => {
      try {
        const response = await fetch(`${API_URL}/api/blog/posts/${postId}`, {
          headers: getHeaders(),
          signal: AbortSignal.timeout(API_TIMEOUT),
        })
        
        if (!response.ok) throw new Error('Post not found')
        return await response.json()
      } catch (error) {
        handleError(error)
      }
    },
  },
}

// Export helper for useApi hook
export const getToken = () => localStorage.getItem('token')

export const isAuthenticated = () => !!getToken()

export default api
