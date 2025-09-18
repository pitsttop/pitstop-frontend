import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

let supabaseClient: SupabaseClient | null = null

// Function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(projectId && publicAnonKey && 
           projectId !== 'your-project-id' && 
           publicAnonKey !== 'your-anon-key')
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    // Create client even if not configured, but with demo values
    // This prevents errors during initial load
    const url = isSupabaseConfigured() 
      ? `https://${projectId}.supabase.co`
      : 'https://demo-project.supabase.co'
    
    const key = isSupabaseConfigured() 
      ? publicAnonKey
      : 'demo-key'
    
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  
  return supabaseClient
}

// Function to reset the client when configuration changes
export function resetSupabaseClient(): void {
  supabaseClient = null
}