// State management store using Zustand
// This replaces Redux for simpler state management

import { create } from 'zustand'

// ==========================================
// USER STORE (Authentication)
// ==========================================

export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: () => set({ user: null, isAuthenticated: false }),

  setLoading: (isLoading) => set({ isLoading }),
}))

// ==========================================
// CART STORE (Future - Store)
// ==========================================

export const useCartStore = create((set) => ({
  items: [],
  total: 0,

  addItem: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id)
      
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
          total: state.total + product.price * quantity,
        }
      }
      
      return {
        items: [...state.items, { ...product, quantity }],
        total: state.total + product.price * quantity,
      }
    }),

  removeItem: (productId) =>
    set((state) => {
      const item = state.items.find((i) => i.id === productId)
      return {
        items: state.items.filter((i) => i.id !== productId),
        total: state.total - (item?.price * item?.quantity || 0),
      }
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const item = state.items.find((i) => i.id === productId)
      const quantityDiff = quantity - (item?.quantity || 0)
      
      return {
        items: state.items.map((i) =>
          i.id === productId ? { ...i, quantity } : i
        ),
        total: state.total + (item?.price * quantityDiff || 0),
      }
    }),

  clearCart: () => set({ items: [], total: 0 }),

  getCartCount: () =>
    useCartStore.getState().items.reduce((sum, item) => sum + item.quantity, 0),
}))

// ==========================================
// WISHLIST STORE (Future)
// ==========================================

export const useWishlistStore = create((set) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      if (state.items.find((item) => item.id === product.id)) {
        return state
      }
      return { items: [...state.items, product] }
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),

  isInWishlist: (productId) =>
    useWishlistStore.getState().items.some((item) => item.id === productId),

  clearWishlist: () => set({ items: [] }),
}))

// ==========================================
// NOTIFICATION STORE
// ==========================================

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now(), ...notification },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))

// ==========================================
// THEME STORE (Future - for dark/light toggle)
// ==========================================

export const useThemeStore = create((set) => ({
  isDark: true,

  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

  setTheme: (isDark) => set({ isDark }),
}))

// ==========================================
// FILTER STORE (For projects, products)
// ==========================================

export const useFilterStore = create((set) => ({
  selectedCategory: 'All',
  selectedSort: 'newest',
  searchQuery: '',

  setCategory: (category) => set({ selectedCategory: category }),

  setSort: (sort) => set({ selectedSort: sort }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  clearFilters: () =>
    set({
      selectedCategory: 'All',
      selectedSort: 'newest',
      searchQuery: '',
    }),
}))

// ==========================================
// MODAL STORE
// ==========================================

export const useModalStore = create((set) => ({
  openModals: {},

  openModal: (modalName, data = null) =>
    set((state) => ({
      openModals: {
        ...state.openModals,
        [modalName]: { isOpen: true, data },
      },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      openModals: {
        ...state.openModals,
        [modalName]: { isOpen: false, data: null },
      },
    })),

  closeAllModals: () => set({ openModals: {} }),

  isModalOpen: (modalName) => !!useModalStore.getState().openModals[modalName]?.isOpen,

  getModalData: (modalName) => useModalStore.getState().openModals[modalName]?.data,
}))

export default {
  useUserStore,
  useCartStore,
  useWishlistStore,
  useNotificationStore,
  useThemeStore,
  useFilterStore,
  useModalStore,
}
