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
    
    // Create missing subscriptions table if it doesn't exist
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
          status TEXT NOT NULL DEFAULT 'trial',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          current_period_start TIMESTAMP,
          current_period_end TIMESTAMP,
          cancel_at_period_end BOOLEAN DEFAULT false,
          billing_interval TEXT NOT NULL DEFAULT 'month',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Subscriptions table ensured to exist');
    } catch (error) {
      console.log('Subscriptions table creation skipped:', error);
    }
    
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