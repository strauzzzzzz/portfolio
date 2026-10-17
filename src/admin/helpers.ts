import { storageUrl, supabase } from '../lib/supabase'

export type MediaKind = 'video' | 'audio' | 'images'

export const MAX_FILE_MB = 50

/** Supabase Auth wants an email, so a plain login is mapped onto this domain. */
const LOGIN_DOMAIN = 'admin.example.com'

export function loginToEmail(login: string) {
  const v = login.trim().toLowerCase()
  return v.includes('@') ? v : `${v}@${LOGIN_DOMAIN}`
}

const VIDEO_EXT = ['mp4', 'webm', 'mov', 'm4v']
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'm4a', 'flac']

export function extOf(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export function mediaType(file: File): MediaKind {
  const ext = extOf(file.name)
  if (VIDEO_EXT.includes(ext) || file.type.startsWith('video/')) return 'video'
  if (AUDIO_EXT.includes(ext) || file.type.startsWith('audio/')) return 'audio'
  return 'images'
}

export async function uploadMedia(file: File): Promise<string> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`«${file.name}» больше ${MAX_FILE_MB} МБ`)
  }
  const ext = extOf(file.name)
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from('media').upload(name, file, {
    cacheControl: '31536000',
    contentType: file.type || undefined,
  })
  if (error) throw error
  return name
}

export function mediaUrl(path: string) {
  return encodeURI(storageUrl(path))
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function errMsg(e: unknown) {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message: unknown }).message)
  }
  return String(e)
}

/** "my-cool_track.final.mp3" becomes "my cool track final". */
export function titleFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_.]+/g, ' ')
    .trim()
}
