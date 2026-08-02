import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import { queryKeys } from '../../constants/queryKeys'

const invalidateProducts = (client) => client.invalidateQueries({ queryKey: ['products'] })
export function useCreateProduct() { const client = useQueryClient(); return useMutation({ mutationFn: (product) => api.post('/api/products', product), onSuccess: () => invalidateProducts(client) }) }
export function useUpdateProduct() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, product }) => api.put(`/api/products?id=${encodeURIComponent(id)}`, product), onSuccess: (_, { id }) => { invalidateProducts(client); client.invalidateQueries({ queryKey: queryKeys.product(id) }); client.invalidateQueries({ queryKey: queryKeys.dashboard }) } }) }
export function useDeleteProduct() { const client = useQueryClient(); return useMutation({ mutationFn: (id) => api.delete(`/api/products?id=${encodeURIComponent(id)}`), onSuccess: () => { invalidateProducts(client); client.invalidateQueries({ queryKey: queryKeys.dashboard }) } }) }
export function useCreateCategory() { const client = useQueryClient(); return useMutation({ mutationFn: (name) => api.post('/api/categories', { name }), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.categories }) }) }
export function useUpdateCMS() { const client = useQueryClient(); return useMutation({ mutationFn: ({ params = {}, body }) => api.put(`/api/cms?${new URLSearchParams(params)}`, body), onSuccess: () => client.invalidateQueries({ queryKey: ['cms'] }) }) }
export function useCreateOrder() { return useMutation({ mutationFn: (body) => api.post('/api/orders', body) }) }
export function useVerifyPayment() { return useMutation({ mutationFn: (body) => api.put('/api/orders', body) }) }
export function useUploadFile() { return useMutation({ mutationFn: (body) => api.post('/api/uploads', body) }) }
export function useUpdateSettings() { const client = useQueryClient(); return useMutation({ mutationFn: (settings) => api.put('/api/settings', { settings }), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.settings }) }) }
