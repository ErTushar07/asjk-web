import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Production Supabase Project Configuration (mcmdgdopjrkbczlhjmty)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mcmdgdopjrkbczlhjmty.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jbWRnZG9wanJrYmN6bGhqbXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTM1NDUsImV4cCI6MjEwNDI4OTU0NX0.0M6c0imjlAlhNYYb6oYzC-OKmD7KyYEdR1EBWQJVcpI';

export const isSupabaseConfigured = true;

/**
 * Standard Supabase Client for Client-Side Operations with RLS
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-application-name': 'asfjk-web-platform',
    },
  },
});
