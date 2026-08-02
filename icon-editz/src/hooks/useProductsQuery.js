import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../constants/queryKeys'

export const normalizeProduct = (product) => ({ ...product, thumbnail: product.thumbnail || product.thumbnail_path, image: product.image || product.thumbnail_path, demoVideo: product.demoVideo || product.demo_video, discountPrice: product.discountPrice ?? product.discount_price })

export function useProductsQuery() {
  return useQuery({ queryKey: queryKeys.products(), queryFn: async () => (await api.get('/api/products')).data.map(normalizeProduct) })
}
