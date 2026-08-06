import crypto from 'node:crypto'
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { StorageProvider } from '../StorageProvider.js'

const safeFileName = (name) => (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '-')

export class R2StorageProvider extends StorageProvider {
  constructor() {
    super()
    this.client = null
  }

  getR2Client() {
    const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
      throw Object.assign(new Error('Cloudflare R2 environment variables are missing'), { status: 503 })
    }
    this.client ||= new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    })
    return this.client
  }

  async upload({ file, folder = 'uploads' }) {
    const r2 = this.getR2Client()
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
    const key = `${cleanFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeFileName(file.originalname)}`

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    )

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
    const r2 = this.getR2Client()
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
      })
    )
    return true
  }

  getPublicUrl(key) {
    if (!key) return ''
    if (key.startsWith('http://') || key.startsWith('https://')) return key
    const baseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
    return baseUrl ? `${baseUrl}/${key}` : key
  }

  async list({ folder = '' } = {}) {
    const r2 = this.getR2Client()
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
    const response = await r2.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET,
        Prefix: cleanFolder ? `${cleanFolder}/` : '',
      })
    )
    return (response.Contents || []).map((item) => ({
      key: item.Key,
      name: item.Key.split('/').pop(),
      size: item.Size,
      updatedAt: item.LastModified?.toISOString(),
      url: this.getPublicUrl(item.Key),
    }))
  }
}
