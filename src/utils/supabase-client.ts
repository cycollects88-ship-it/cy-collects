import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (if needed)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
