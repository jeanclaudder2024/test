import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure postgres connection with better error handling
export const pool = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {}, // Suppress notices
  transform: {
    undefined: null,
  },
});
export const db = drizzle(pool, { schema });

export function getActiveDb() {
  return db;
}
