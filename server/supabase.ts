import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

// Create Supabase client for server-side operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

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