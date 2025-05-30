import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Get Supabase database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set with your Supabase PostgreSQL connection string");
}

// Create PostgreSQL connection to Supabase
const sql = postgres(DATABASE_URL, {
  max: 10,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(sql, { schema });

console.log('Connected to Supabase database');

export function getActiveDb() {
  return db;
}
