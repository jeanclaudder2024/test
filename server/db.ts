import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Primary database connection (your existing database)
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Secondary database connection (Supabase)
let supabasePool: Pool | null = null;
let supabaseDb: any = null;

if (process.env.SUPABASE_DATABASE_URL) {
  try {
    supabasePool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
    supabaseDb = drizzle({ client: supabasePool, schema });
    console.log('Supabase database connection established');
  } catch (error) {
    console.warn('Failed to connect to Supabase database:', error);
  }
}

// Export both database connections
export const primaryDb = db; // Your existing database
export const secondaryDb = supabaseDb; // Supabase database

// Helper function to get the active database based on environment
export function getActiveDb() {
  const useSupabase = process.env.USE_SUPABASE === 'true';
  
  if (useSupabase && supabaseDb) {
    console.log('Using Supabase database');
    return supabaseDb;
  } else {
    console.log('Using primary database');
    return primaryDb;
  }
}

// Helper function to switch database at runtime
export function switchToDatabase(dbType: 'primary' | 'supabase') {
  if (dbType === 'supabase') {
    if (!supabaseDb) {
      throw new Error('Supabase database not configured. Please set SUPABASE_DATABASE_URL');
    }
    return supabaseDb;
  } else {
    return primaryDb;
  }
}
