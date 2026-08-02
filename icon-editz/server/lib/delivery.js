import { Resend } from 'resend'
import { createSignedR2DownloadUrl } from './r2.js'

export async function createDelivery(order) {
  const delivery = await createSignedR2DownloadUrl(order.products?.download_key, order.products?.download_filename || order.product_name)
  return delivery
}

export async function sendDeliveryEmail(order, delivery) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = order.customer_name || 'there'
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Icon Editz <orders@iconeditz.com>',
    to: [order.customer_email],
    subject: 'Your Icon Editz Purchase',
    text: `Hi ${name}\n\nThank you for purchasing\n\n${order.product_name}\n\nDownload:\n\n${delivery.downloadUrl}\n\nThis link expires in 15 minutes.\n\nNeed help?\n\nsupport@iconeditz.com`,
  })
}
