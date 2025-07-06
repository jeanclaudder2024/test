import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseUrl = process.env.DATABASE_URL;

// Configure connection pool for Supabase - simplified configuration
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: true,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

console.log('🔗 Connecting to database with pg library...');

export const db = drizzle(pool, { schema });

// Test the connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT version(), current_database(), current_user');
    console.log('✅ Database connection successful!');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export default db;