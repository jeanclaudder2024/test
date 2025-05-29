import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Supabase database connection (only database)
const SUPABASE_DATABASE_URL = "postgresql://postgres.fahvjksfkzmbsyvtktyk:Jonny@2025@@aws-0-us-east-2.pooler.supabase.com:6543/postgres";

export const pool = new Pool({ connectionString: SUPABASE_DATABASE_URL });
export const db = drizzle({ client: pool, schema });

console.log('✅ Connected to Supabase database');

// Helper function to get the active database (always Supabase)
export function getActiveDb() {
  console.log('Using Supabase database');
  return db;
}
