
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const SUPABASE_URL = "https://dtfiwlxygrgsedujclqp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Zml3bHh5Z3Jnc2VkdWpjbHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MjY4MzgsImV4cCI6MjA1ODIwMjgzOH0.iotPC_OB2a6yk6tjQsJC-_Ckq6zKWIygCt9rSZBPwOY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
