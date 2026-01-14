// Safe Supabase client wrapper that handles missing env vars gracefully
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Get environment variables with fallbacks for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Check if we have valid credentials
export const isSupabaseAvailable = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Create client only if credentials are available
export const supabase: SupabaseClient<Database> = isSupabaseAvailable 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : ({
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signInWithOtp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        verifyOtp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }) }) }),
        insert: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        update: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        delete: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      }),
    } as unknown as SupabaseClient<Database>);

// Log warning if not configured
if (!isSupabaseAvailable) {
  console.warn('Supabase credentials not found. Authentication features will be disabled.');
}
