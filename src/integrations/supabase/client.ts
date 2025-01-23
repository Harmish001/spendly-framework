import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yowicgnlkpoxqrtcjwov.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvd2ljZ25sa3BveHFydGNqd292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzMwODgsImV4cCI6MjA1MjYwOTA4OH0.APBX-zdNFz5Z-85Hy2KCgJCYaWEiuC6mhZ92p0Z6w-Q";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'spendly-auth-token',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);