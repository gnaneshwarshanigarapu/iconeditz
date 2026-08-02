import crypto from 'node:crypto'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let client

const getR2Client = () => {
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw Object.assign(new Error('Cloudflare R2 is not configured'), { status: 503 })
  }
  client ||= new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  })
  return client
}

// R2 objects must remain private. This is the only download URL issued to buyers.
export const createSignedR2DownloadUrl = async (key, filename = 'download') => {
  if (!key) throw Object.assign(new Error('This product does not have a downloadable file configured'), { status: 409 })
  const expiresIn = 15 * 60
  const url = await getSignedUrl(getR2Client(), new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${safeFileName(filename)}"`,
  }), { expiresIn })
  return { downloadUrl: url, expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() }
}

const safeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '-')

export const uploadToR2 = async (file, folder = 'uploads') => {
  const r2 = getR2Client()
  const key = `${folder.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.originalname)}`
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }))
  return {
    key,
    url: `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`,
    size: file.size,
    name: file.originalname,
    type: file.mimetype,
  }
}
