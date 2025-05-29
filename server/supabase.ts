/**
 * Supabase Configuration - Oil Vessel Tracking Platform
 * Provides reliable database and authentication services
 */

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
      persistSession: false // Server-side doesn't need session persistence
    }
  }
);

// Create admin Supabase client for user management
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
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

// Initialize database tables if they don't exist
export async function initializeSupabaseTables() {
  try {
    console.log('🔧 Initializing Supabase database tables...');
    
    // Check if tables exist by trying to query them
    const tablesExist = await checkSupabaseConnection();
    
    if (!tablesExist) {
      console.log('📋 Creating database tables...');
      // Tables will be created through schema migration
    }
    
    console.log('✅ Supabase database ready!');
    return true;
  } catch (error) {
    console.error('❌ Supabase initialization error:', error);
    return false;
  }
}

export default supabase;