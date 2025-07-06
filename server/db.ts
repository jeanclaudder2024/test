// Switch to using the Supabase client for direct Supabase connectivity
import { supabase, testSupabaseConnection } from './db-supabase';

// Test connection on startup
testSupabaseConnection().then((success) => {
  if (success) {
    console.log("✅ Supabase connection established");
  } else {
    console.error("❌ Failed to establish Supabase connection");
  }
});

export { supabase as db };

export function getActiveDb() {
  return supabase;
}
