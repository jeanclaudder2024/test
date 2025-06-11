import { db } from './db.js';
import { users, userSubscriptions } from '@shared/schema.js';
import { sql } from 'drizzle-orm';

export async function initializeCustomAuthTables() {
  try {
    console.log('Initializing custom authentication tables...');
    
    // Drop existing tables if they exist
    await db.execute(sql`DROP TABLE IF EXISTS user_subscriptions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS subscription_plans CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    
    // Create users table with auto-incrementing ID
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create subscription_plans table first
    await db.execute(sql`
      CREATE TABLE subscription_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        interval TEXT NOT NULL DEFAULT 'monthly',
        features TEXT[],
        stripe_price_id TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create user_subscriptions table
    await db.execute(sql`
      CREATE TABLE user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
        status TEXT NOT NULL DEFAULT 'trial',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        billing_interval TEXT DEFAULT 'monthly',
        trial_start_date TIMESTAMP NOT NULL,
        trial_end_date TIMESTAMP NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes for better performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id)`);
    
    console.log('Custom authentication tables created successfully');
    
    // Insert test admin user (password: "admin123")
    const adminPasswordHash = '$2b$10$ebkZSUL1mgyDtDQLr4Zr6OOoYsMtY8sNGnInRutSPTwgZfFhBeCyK';
    
    await db.execute(sql`
      INSERT INTO users (email, password, first_name, last_name, role) 
      VALUES ('admin@petrodealhub.com', ${adminPasswordHash}, 'Admin', 'User', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);
    
    console.log('Test admin user created: admin@petrodealhub.com / admin123');
    
  } catch (error) {
    console.error('Error initializing custom auth tables:', error);
    throw error;
  }
}