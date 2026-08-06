import crypto from 'node:crypto'
import { StorageProvider } from '../StorageProvider.js'
import { getSupabaseAdmin } from '../../supabaseAdmin.js'

const safeFileName = (name) => (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '-')

export class SupabaseStorageProvider extends StorageProvider {
  constructor() {
    super()
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads'
  }

  get client() {
    return getSupabaseAdmin()
  }

  /**
   * Helper to ensure bucket exists and is public.
   */
  async ensureBucketExists() {
    try {
      const { data: buckets } = await this.client.storage.listBuckets()
      const exists = (buckets || []).some((b) => b.name === this.bucketName)
      if (!exists) {
        await this.client.storage.createBucket(this.bucketName, { public: true })
      }
    } catch {
      // Ignore bucket creation errors if already present or managed via policies
    }
  }

  async upload({ file, folder = 'uploads' }) {
    await this.ensureBucketExists()
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
    const key = `${cleanFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeFileName(file.originalname)}`

    const { error } = await this.client.storage
      .from(this.bucketName)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      })

    if (error) {
      throw Object.assign(new Error(`Supabase Storage upload failed: ${error.message}`), { status: 500 })
    }

    const publicUrl = this.getPublicUrl(key)

    return {
      key,
      url: publicUrl,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    }
  }

  async delete({ key }) {
    if (!key) return false
    const { error } = await this.client.storage.from(this.bucketName).remove([key])
    if (error) {
      throw Object.assign(new Error(`Supabase Storage deletion failed: ${error.message}`), { status: 500 })
    }
    return true
  }

  getPublicUrl(key) {
    if (!key) return ''
    if (key.startsWith('http://') || key.startsWith('https://')) return key
    const { data } = this.client.storage.from(this.bucketName).getPublicUrl(key)
    return data?.publicUrl || ''
  }

  async list({ folder = '' } = {}) {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
    const { data, error } = await this.client.storage.from(this.bucketName).list(cleanFolder)
    if (error) {
      throw Object.assign(new Error(`Supabase Storage list failed: ${error.message}`), { status: 500 })
    }
    return (data || []).map((item) => {
      const key = cleanFolder ? `${cleanFolder}/${item.name}` : item.name
      return {
        key,
        name: item.name,
        size: item.metadata?.size || 0,
        updatedAt: item.updated_at || item.created_at,
        url: this.getPublicUrl(key),
      }
    })
  }
}
