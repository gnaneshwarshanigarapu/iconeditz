import { SupabaseStorageProvider } from './providers/SupabaseStorageProvider.js'
import { R2StorageProvider } from './providers/R2StorageProvider.js'

export class StorageService {
  constructor() {
    this.providers = new Map()
  }

  /**
   * Get active storage provider based on STORAGE_PROVIDER environment variable.
   * Defaults to 'supabase'.
   * @returns {import('./StorageProvider.js').StorageProvider}
   */
  getProvider() {
    const providerName = (process.env.STORAGE_PROVIDER || 'supabase').toLowerCase()
    if (!this.providers.has(providerName)) {
      switch (providerName) {
        case 'r2':
          this.providers.set('r2', new R2StorageProvider())
          break
        case 'supabase':
        default:
          this.providers.set('supabase', new SupabaseStorageProvider())
          break
      }
    }
    return this.providers.get(providerName)
  }

  async upload({ file, folder = 'uploads' }) {
    return this.getProvider().upload({ file, folder })
  }

  async delete({ key }) {
    return this.getProvider().delete({ key })
  }

  getPublicUrl(key) {
    return this.getProvider().getPublicUrl(key)
  }

  async list({ folder = '' } = {}) {
    return this.getProvider().list({ folder })
  }
}

export const storageService = new StorageService()
