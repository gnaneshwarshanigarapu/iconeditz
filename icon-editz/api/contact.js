export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { name, email, subject, message } = req.body || {}

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please complete all fields.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ message: 'Please provide a valid email address.' })
  }

  return res.status(200).json({
    message: 'Thanks for reaching out. I will get back to you soon.',
    success: true,
  })
}
