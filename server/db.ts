import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
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

// Third database connection (MySQL)
let mysqlConnection: any = null;
let mysqlDb: any = null;

// Configure MySQL connection with provided credentials
const mysqlConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306,
  ssl: false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

try {
  mysqlConnection = mysql.createPool(mysqlConfig);
  mysqlDb = drizzleMysql(mysqlConnection, { schema, mode: 'default' });
  console.log('✅ MySQL backup database connection established');
  console.log(`🔗 Connected to: ${mysqlConfig.database} on ${mysqlConfig.host}`);
} catch (error) {
  console.warn('❌ Failed to connect to MySQL backup database:', error);
}

// Export all database connections
export const primaryDb = db; // Your existing PostgreSQL database
export const secondaryDb = supabaseDb; // Supabase database
export const tertiaryDb = mysqlDb; // MySQL database

// Helper function to get the active database based on environment
export function getActiveDb() {
  const useSupabase = process.env.USE_SUPABASE === 'true';
  const useMySQL = process.env.USE_MYSQL === 'true';
  
  if (useMySQL && mysqlDb) {
    console.log('Using MySQL database');
    return mysqlDb;
  } else if (useSupabase && supabaseDb) {
    console.log('Using Supabase database');
    return supabaseDb;
  } else {
    console.log('Using primary PostgreSQL database');
    return primaryDb;
  }
}

// Helper function to switch database at runtime
export function switchToDatabase(dbType: 'primary' | 'supabase' | 'mysql') {
  if (dbType === 'mysql') {
    if (!mysqlDb) {
      throw new Error('MySQL database not configured. Please set MYSQL_DATABASE_URL');
    }
    return mysqlDb;
  } else if (dbType === 'supabase') {
    if (!supabaseDb) {
      throw new Error('Supabase database not configured. Please set SUPABASE_DATABASE_URL');
    }
    return supabaseDb;
  } else {
    return primaryDb;
  }
}
