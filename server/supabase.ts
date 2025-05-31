import { createClient } from '@supabase/supabase-js';

// Default values to prevent deployment errors
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have real credentials
const hasValidCredentials = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

if (!hasValidCredentials) {
  console.warn('⚠️  Supabase credentials missing - database features will be limited');
}

// Create Supabase client for server-side operations
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

export { hasValidCredentials };

// Database connection status checker
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('vessels').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;