import { createClient } from '@supabase/supabase-js'

/** Same Supabase project as Shows / Emily when env vars are not set at build time. */
const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL || 'https://xjbczicveswmvfezogzz.supabase.co'
).trim()
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_xnN5J4Tkvd1ut8GL0oLM6w_xnbokGv0'
).trim()

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
