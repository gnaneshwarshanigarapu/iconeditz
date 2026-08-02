import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../constants/queryKeys'
import { normalizeProduct } from './useProductsQuery'

export function useProduct(id) {
  return useQuery({ queryKey: queryKeys.product(id), enabled: Boolean(id), queryFn: async () => { const payload = await api.get(`/api/products?id=${encodeURIComponent(id)}`); return payload.product ? normalizeProduct(payload.product) : null } })
}
