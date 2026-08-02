import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../constants/queryKeys'
export const useCategories = () => useQuery({ queryKey: queryKeys.categories, queryFn: async () => (await api.get('/api/categories')).data || [] })
