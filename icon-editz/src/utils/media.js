export const supabaseVideoMap = {
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

export function resolveVideoUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const filename = url.split('/').pop()
  if (filename && supabaseVideoMap[filename]) {
    return supabaseVideoMap[filename]
  }

  return url
}
