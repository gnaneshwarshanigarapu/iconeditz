import { Resend } from 'resend'
import { createSignedR2DownloadUrl } from './r2.js'
import { supabaseAdmin } from './supabaseAdmin.js'

const safeFileName = (name) => (name || 'download').replace(/[^a-zA-Z0-9._-]/g, '-')

export async function createDelivery(order) {
  const downloadKey = order.products?.download_key || order.download_key
  const filename = order.products?.download_filename || order.product_name || 'asset'

  if (!downloadKey) {
    console.warn(`[Download URL Generation] Order ${order.id} has no download_key configured on product`)
    return { downloadUrl: null, message: 'No downloadable file linked to this product' }
  }

  // Direct HTTP/HTTPS URL
  if (downloadKey.startsWith('http://') || downloadKey.startsWith('https://')) {
    console.log(`[Download URL Generation] Order ${order.id}: Direct URL detected`)
    return { downloadUrl: downloadKey, expiresAt: new Date(Date.now() + 86400000).toISOString() }
  }

  // Provider 1: Cloudflare R2
  const provider = (process.env.STORAGE_PROVIDER || 'supabase').toLowerCase()
  if (provider === 'r2' && process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID) {
    try {
      console.log(`[Download URL Generation] Generating Cloudflare R2 signed URL for key: ${downloadKey}`)
      const r2Result = await createSignedR2DownloadUrl(downloadKey, filename)
      return r2Result
    } catch (r2Error) {
      console.warn(`[Download URL Generation] R2 generation failed, falling back to Supabase Storage:`, r2Error.message)
    }
  }

  // Provider 2: Supabase Storage
  try {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads'
    const expiresIn = 15 * 60 // 15 minutes
    console.log(`[Download URL Generation] Generating Supabase Storage signed URL for bucket '${bucket}', key: ${downloadKey}`)

    const cleanKey = downloadKey.replace(new RegExp(`^${bucket}/`), '').replace(/^\/+/, '')
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(cleanKey, expiresIn, {
        download: safeFileName(filename),
      })

    if (!error && data?.signedUrl) {
      return {
        downloadUrl: data.signedUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      }
    }
    if (error) {
      console.warn(`[Download URL Generation] Supabase createSignedUrl notice:`, error.message)
    }
  } catch (supabaseError) {
    console.error(`[Download URL Generation] Supabase Storage signed URL exception:`, supabaseError.message)
  }

  // Fallback: Construct public URL from Supabase Storage
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads'
  const publicUrl = `${process.env.SUPABASE_URL || 'https://airzrnsiuzbdugmmcmts.supabase.co'}/storage/v1/object/public/${bucket}/${downloadKey.replace(/^\/+/, '')}`
  return {
    downloadUrl: publicUrl,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  }
}

export async function sendDeliveryEmail(order, delivery) {
  const isResendEnabled = process.env.RESEND_ENABLED === 'true'
  const apiKey = process.env.RESEND_API_KEY

  if (!isResendEnabled || !apiKey) {
    console.log('[Email Sending] RESEND_ENABLED is false or RESEND_API_KEY is not configured. Email skipped.')
    return { skipped: true, message: 'Email disabled or unconfigured' }
  }

  const resend = new Resend(apiKey)
  const recipient = order.customer_email
  const customerName = order.customer_name || 'valued customer'
  const productName = order.product_name || 'your purchased creative asset'
  const downloadLink = delivery?.downloadUrl || '#'
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Icon Editz <orders@iconeditz.com>'

  console.log(`[Email Sending] Initiating delivery email to ${recipient} via Resend...`)

  const sendEmailAttempt = async () => {
    return resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject: `Your Purchase: ${productName} - Icon Editz`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b0717; color: #ffffff; padding: 32px; border-radius: 16px;">
          <h2 style="color: #a855f7; margin-bottom: 16px;">Thank you for your purchase!</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Hi ${customerName},</p>
          <p style="font-size: 15px; color: #cbd5e1;">Your payment for <strong>${productName}</strong> was successful.</p>
          ${delivery?.downloadUrl ? `
            <div style="margin: 28px 0;">
              <a href="${downloadLink}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 9999px; display: inline-block;">⬇ Download Your File</a>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">This secure download link expires in 15 minutes. You can also generate fresh download links anytime from your dashboard.</p>
          ` : `
            <p style="font-size: 14px; color: #fef08a;">Your purchase is confirmed. Please contact support@iconeditz.com if you need assistance retrieving your file.</p>
          `}
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">Icon Editz • Premium Video Editing & Motion Graphics<br />Questions? Contact support@iconeditz.com</p>
        </div>
      `,
      text: `Hi ${customerName},\n\nThank you for purchasing ${productName}!\n\nDownload your file here:\n${downloadLink}\n\nNeed help? Contact support@iconeditz.com`,
    })
  }

  try {
    const result = await sendEmailAttempt()
    if (result.error) {
      console.warn(`[Email Sending] Attempt 1 failed: ${result.error.message}. Retrying in 1s...`)
      await new Promise((r) => setTimeout(r, 1000))
      const retryResult = await sendEmailAttempt()
      if (retryResult.error) {
        throw new Error(retryResult.error.message || 'Failed to send email via Resend after retry')
      }
      console.log(`[Email Sending] SUCCESS on retry 2 for ${recipient}!`)
      return retryResult
    }
    console.log(`[Email Sending] SUCCESS on attempt 1 for ${recipient}!`)
    return result
  } catch (err) {
    console.error(`[Email Sending] FAILED for ${recipient}:`, err.message)
    throw err
  }
}
