import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set");
}

console.log('Connecting to database...');

// Fix the DATABASE_URL by properly encoding special characters
let fixedUrl = DATABASE_URL;
// The password contains [Jonny@2025@] which needs to be URL encoded
if (fixedUrl.includes('[Jonny@2025@]')) {
  fixedUrl = fixedUrl.replace('[Jonny@2025@]', encodeURIComponent('Jonny@2025@'));
}

// Create PostgreSQL connection with proper SSL configuration for Supabase
const sql = postgres(fixedUrl, {
  ssl: { rejectUnauthorized: false },
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(sql, { schema });

console.log('Connected to Supabase database');

export function getActiveDb() {
  return db;
}
