import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_KEY must be set. Did you forget to add your Supabase credentials?",
  );
}

// Create Supabase client for Supabase-specific operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Create Postgres client for Drizzle ORM
const connectionString = process.env.DATABASE_URL || `${process.env.SUPABASE_URL.replace('.co', '.co:5432')}/postgres`;
export const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

// For backwards compatibility with code that might be using the old connections
export const pool = {
  query: async (...args: any[]) => {
    console.log('Using legacy pool query with Supabase, args:', args[0]);
    return await client.unsafe(args[0], args[1] || []);
  }
};
