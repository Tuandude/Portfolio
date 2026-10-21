import { createClient } from '@supabase/supabase-js';

// Safe fallback for environment variables
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isSupabaseConfigured = Boolean(
  (import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
