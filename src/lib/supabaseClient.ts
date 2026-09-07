import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl.trim() && supabaseAnonKey.trim());

/**
 * Standard Supabase Client for Client-Side Operations with RLS
 * Falls back to a safe mock proxy client if environment variables are not configured.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : (new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === 'auth') {
            return {
              onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
              getSession: async () => ({ data: { session: null }, error: null }),
              signInWithPassword: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
              signOut: async () => ({ error: null }),
            };
          }
          if (prop === 'functions') {
            return {
              invoke: async (functionName: string) => {
                console.warn(`[SupabaseClient] functions.invoke('${functionName}') called but Supabase is not configured.`);
                return { data: null, error: new Error('Supabase Edge Functions are not configured in this environment.') };
              },
            };
          }
          return () => {
            console.warn(`[SupabaseClient] Method ${String(prop)} called but Supabase is not configured.`);
            return {
              select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
              insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
            };
          };
        },
      }
    ) as unknown as SupabaseClient);

