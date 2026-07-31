import multer from 'multer'
import crypto from 'node:crypto'
import { supabaseAdmin } from './lib/supabaseAdmin.js'
import { authorizeAdmin } from './lib/auth.js'
import { withApi } from './lib/handler.js'

export const config = { api: { bodyParser: false } }

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 5 } })
const allowedStatuses = ['Pending', 'Contacted', 'In Progress', 'Completed', 'Cancelled']

const parseUpload = (req, res) => new Promise((resolve, reject) => {
  upload.array('files', 5)(req, res, (error) => (error ? reject(Object.assign(error, { status: 400 })) : resolve()))
})

export default withApi(['GET', 'POST', 'PATCH', 'DELETE'], async (req, res) => {
  if (req.method === 'POST') {
    await parseUpload(req, res)
    const required = ['client_name', 'email', 'phone', 'project_type', 'budget', 'deadline', 'location', 'service', 'message', 'preferred_contact']
    for (const field of required) if (!req.body[field]) throw Object.assign(new Error(`${field.replaceAll('_', ' ')} is required`), { status: 400 })

    const attachments = []
    const bucket = process.env.SUPABASE_HIRE_REQUESTS_BUCKET
    for (const file of req.files || []) {
      if (!bucket) throw Object.assign(new Error('File uploads are not configured'), { status: 503 })
      const path = `${Date.now()}-${crypto.randomUUID()}-${file.originalname}`
      const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file.buffer, { contentType: file.mimetype, upsert: false })
      if (error) throw error
      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
      attachments.push({ name: file.originalname, url: data.publicUrl })
    }

    const payload = Object.fromEntries(['client_name', 'email', 'phone', 'company', 'project_type', 'budget', 'deadline', 'location', 'service', 'message', 'reference_link', 'preferred_contact'].map((key) => [key, req.body[key] || null]))
    const { data, error } = await supabaseAdmin.from('hire_requests').insert({ ...payload, attachments }).select().single()
    if (error) throw error
    return res.status(201).json({ data })
  }

  authorizeAdmin(req)
  const id = req.query.id
  if (req.method === 'GET') {
    let query = supabaseAdmin.from('hire_requests').select('*').order('created_at', { ascending: false })
    if (req.query.status) query = query.eq('status', req.query.status)
    if (req.query.project_type) query = query.eq('project_type', req.query.project_type)
    if (req.query.from) query = query.gte('created_at', req.query.from)
    if (req.query.to) query = query.lte('created_at', `${req.query.to}T23:59:59.999Z`)
    const { data, error } = await query
    if (error) throw error
    return res.json({ data: data || [] })
  }
  if (!id) throw Object.assign(new Error('Request id is required'), { status: 400 })
  if (req.method === 'PATCH') {
    if (!allowedStatuses.includes(req.body.status)) throw Object.assign(new Error('Invalid status'), { status: 400 })
    const { data, error } = await supabaseAdmin.from('hire_requests').update({ status: req.body.status }).eq('id', id).select().single()
    if (error) throw error
    return res.json({ data })
  }
  const { error } = await supabaseAdmin.from('hire_requests').delete().eq('id', id)
  if (error) throw error
  return res.status(204).end()
})
