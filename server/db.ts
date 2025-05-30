import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Get Supabase database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set with your Supabase PostgreSQL connection string");
}

// Create PostgreSQL connection to Supabase
const sql = postgres({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  username: 'postgres.fahvjksfkzmbsyvtktyk',
  password: 'Jonny@2025@',
  ssl: { rejectUnauthorized: false },
  max: 10
});

export const db = drizzle(sql, { schema });

console.log('Connected to Supabase database');

export function getActiveDb() {
  return db;
}
