import crypto from 'node:crypto'

const isMissingSchemaError = (error) => ['PGRST205', '42P01'].includes(error?.code) || /schema cache|relation .* does not exist|could not find the table/i.test(error?.message || '')

export const withApi = (methods, fn) => async (req, res) => {
  const id = crypto.randomUUID()
  res.setHeader('X-Request-Id', id)
  const started = Date.now()
  try {
    const mappedHandler = typeof methods === 'object' && !Array.isArray(methods) ? methods[req.method] : null
    if (mappedHandler) return await mappedHandler(req, res)
    if (!Array.isArray(methods) || !methods.includes(req.method)) return res.status(405).json({ success: false, message: 'Method not allowed', error: { message: 'Method not allowed' } })
    return await fn(req, res)
  } catch (error) {
    console.error(JSON.stringify({ id, path: req.url, method: req.method, error: error.message, stack: error.stack }))
    const missingSchema = isMissingSchemaError(error)
    const validationError = error?.name === 'ZodError'
    const status = missingSchema ? 503 : validationError ? 422 : error.status || 500
    const message = missingSchema ? 'The database schema is not initialized. Run the Supabase migration deployment, then retry.' : validationError ? 'Invalid request data' : error.status ? error.message : 'Internal server error'
    return res.status(status).json({ success: false, message, error: { code: missingSchema ? 'DATABASE_NOT_INITIALIZED' : validationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR', message, details: validationError ? error.issues : undefined, requestId: id } })
  } finally {
    console.info(JSON.stringify({ id, method: req.method, path: req.url, status: res.statusCode, durationMs: Date.now() - started }))
  }
}
