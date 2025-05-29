
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Ensure these environment variables are set in your Netlify build environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
