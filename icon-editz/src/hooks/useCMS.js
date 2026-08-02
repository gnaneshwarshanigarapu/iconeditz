import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../constants/queryKeys'
export const useCMS = (params = {}) => useQuery({ queryKey: queryKeys.cms(params), queryFn: async () => { const search = new URLSearchParams(Object.entries(params).filter(([, value]) => value)); return (await api.get(`/api/cms?${search}`)).data ?? {} } })
