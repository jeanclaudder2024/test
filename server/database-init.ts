import { db } from './db.js';
import { sql } from 'drizzle-orm';

export async function initializeCustomAuthTables() {
  try {
    console.log('Connecting to database...');
    
    // Quick database connectivity check
    await db.execute(sql`SELECT 1`);
    console.log('Connected to Supabase database');
    
    // Skip table creation during deployment to avoid timeout
    // Tables should already exist in production database
    console.log('Skipping table initialization for production deployment');
    
  } catch (error) {
    console.error('Error initializing custom auth tables:', error);
    throw error;
  }
}