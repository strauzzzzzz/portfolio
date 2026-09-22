import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dwuokdmajingzakhrksb.supabase.co'
const supabaseKey = 'sb_publishable_7VW-z-iiLT7B1s2IcmSMYQ_6oT6kVtt'

export const supabase = createClient(supabaseUrl, supabaseKey)

export function storageUrl(path: string) {
  if (/^(https?:\/\/|\/)/.test(path)) return path
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
