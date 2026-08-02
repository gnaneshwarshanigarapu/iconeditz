export const queryKeys = {
  products: (filters) => ['products', filters || {}],
  product: (id) => ['product', id],
  categories: ['categories'],
  cms: (params) => ['cms', params || {}],
  orders: (params) => ['orders', params || {}],
  downloads: ['downloads'],
  settings: ['settings'],
  dashboard: ['dashboard'],
  newsletter: ['newsletter'],
  analytics: ['analytics'],
  hireRequests: (filters) => ['hireRequests', filters || {}],
}
