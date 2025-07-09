import { db } from './db.js';
import { sql } from 'drizzle-orm';
import { storage } from './storage.js';

export async function initializeCustomAuthTables() {
  try {
    console.log('Connecting to database...');
    
    // Quick database connectivity check
    await db.execute(sql`SELECT 1`);
    console.log('Connected to Supabase database');
    
    // Skip table creation during deployment to avoid timeout
    // Tables should already exist in production database
    console.log('Skipping table initialization for production deployment');
    
    // Initialize subscription plans if they don't exist
    try {
      await storage.initializeSubscriptionPlans();
    } catch (error) {
      console.log('Subscription plans initialization skipped:', error);
    }
    
  } catch (error) {
    console.error('Error initializing custom auth tables:', error);
    throw error;
  }
}