import crypto from 'node:crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

let client

const getR2Client = () => {
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
    throw Object.assign(new Error('Cloudflare R2 is not configured'), { status: 503 })
  }
  client ||= new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  })
  return client
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
