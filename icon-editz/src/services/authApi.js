export async function ensureDefaultAdmin() {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'bootstrap-admin' }),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error?.message || payload.error || payload.message || 'Unable to initialize administrator access.')
  }
}
