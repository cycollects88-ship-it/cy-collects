import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Regular Supabase client for user operations
 * Uses anon key with Row Level Security (RLS)
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'cy-collects-auth',
  }
})

/**
 * Admin Supabase client for admin operations
 * Uses service role key which bypasses RLS
 * Only use this for admin-level operations like listing all users
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
})
