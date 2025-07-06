import { createClient } from '@supabase/supabase-js';
import type { Database } from '@shared/supabase-types';

// Environment configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fahvjksfkzmbsyvtktyk.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaHZqa3Nma3ptYnN5dnRrdHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzgwMDMsImV4cCI6MjA2NDA1NDAwM30.TsfzDouSyN-jQE0uM36LV2UmVljAUbr92rPry9kZR78';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    const { data, error } = await supabase.from('vessels').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// Export default client
export default supabase;