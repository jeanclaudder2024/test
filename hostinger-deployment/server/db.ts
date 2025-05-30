import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Use Supabase database URL from environment
const DATABASE_URL = process.env.SUPABASE_URL 
  ? `postgresql://postgres.fahvjksfkzmbsyvtktyk:Jonny@2025@@aws-0-us-east-2.pooler.supabase.com:6543/postgres`
  : process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL or SUPABASE_URL must be set");
}

// Create PostgreSQL connection
const sql = postgres(DATABASE_URL, {
  max: 10,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(sql, { schema });

console.log('✅ Connected to Supabase database');

// Helper function to get the active database (always Supabase)
export function getActiveDb() {
  console.log('Using Supabase database');
  return db;
}
