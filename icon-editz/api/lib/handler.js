import crypto from 'node:crypto'

// Accept either a shared handler with an allowed-method list, or a method map.
export const withApi = (methods, fn) => async (req, res) => {
  const id = crypto.randomUUID()
  res.setHeader('X-Request-Id', id)
  const started = Date.now()
  try {
    const mappedHandler = typeof methods === 'object' && !Array.isArray(methods) ? methods[req.method] : null
    if (mappedHandler) return await mappedHandler(req, res)
    if (!Array.isArray(methods) || !methods.includes(req.method)) return res.status(405).json({ error: { message: 'Method not allowed' } })
    await fn(req, res)
  } catch (error) {
    console.error(JSON.stringify({ id, path: req.url, method: req.method, error: error.message, stack: error.stack }))
    res.status(error.status || 500).json({ error: { message: error.status ? error.message : 'Internal server error' } })
  } finally {
    console.info(JSON.stringify({ id, method: req.method, path: req.url, status: res.statusCode, durationMs: Date.now() - started }))
  }
}
