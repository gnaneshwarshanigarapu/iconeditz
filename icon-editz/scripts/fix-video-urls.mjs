import dotenv from 'dotenv'
import { getSupabaseAdmin } from '../server/lib/supabaseAdmin.js'

dotenv.config({ path: '.env' })

const supabaseVideoMap = {
  '3d-lyrics-video-1.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031466505-37054005-3d-lyrics-video-1.mp4',
  '3d-lyrics-video-2.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031469141-6822efcb-3d-lyrics-video-2.mp4',
  '3d-lyrics-video-3.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031470636-ae658047-3d-lyrics-video-3.mp4',
  'birthday.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031472744-35587281-birthday.mp4',
  'lyrics-video-naa.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031476425-11442362-lyrics-video-naa.mp4',
  'lyrics-video.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031479314-052c39d5-lyrics-video.mp4',
  'pochamma-fast-beat.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031483022-9e8e0180-pochamma-fast-beat.mp4',
  'pochamma-full-video.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031484747-2ab22490-pochamma-full-video.mp4',
  'pre-wedding-video.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031489290-f1e0a45c-pre-wedding-video.mp4',
  'whatsapp-status-fast-beat.mp4': 'https://airzrnsiuzbdugmmcmts.supabase.co/storage/v1/object/public/uploads/videos/1786031490283-cb165877-whatsapp-status-fast-beat.mp4',
}

function replaceVideoPaths(obj) {
  let str = JSON.stringify(obj)
  for (const [filename, url] of Object.entries(supabaseVideoMap)) {
    str = str.replaceAll(`/assets/videos/${filename}`, url)
    str = str.replaceAll(`assets/videos/${filename}`, url)
  }
  return JSON.parse(str)
}

;(async () => {
  console.log('Fixing video URLs in Supabase page_content table...')
  const supabase = getSupabaseAdmin()

  const { data: rows, error: fetchErr } = await supabase.from('page_content').select('*')
  if (fetchErr) {
    console.error('Fetch error:', fetchErr)
    return
  }

  let updatedCount = 0
  for (const row of rows || []) {
    const originalContent = row.content
    const updatedContent = replaceVideoPaths(originalContent)
    if (JSON.stringify(originalContent) !== JSON.stringify(updatedContent)) {
      const { error: updateErr } = await supabase
        .from('page_content')
        .update({ content: updatedContent })
        .eq('id', row.id)
      if (updateErr) {
        console.error(`Error updating row ${row.id}:`, updateErr)
      } else {
        console.log(`  ✓ Updated page_content row ${row.id} (${row.page} -> ${row.section})`)
        updatedCount++
      }
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} rows in page_content!`)
})()
