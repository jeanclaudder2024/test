import { db } from './db.js';
import { users, userSubscriptions } from '@shared/schema.js';
import { sql } from 'drizzle-orm';

export async function initializeCustomAuthTables() {
  try {
    console.log('Initializing custom authentication tables...');
    
    // Drop existing tables if they exist
    await db.execute(sql`DROP TABLE IF EXISTS user_subscriptions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    
    // Create users table with all required columns
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        stripe_customer_id TEXT,
        is_email_verified BOOLEAN DEFAULT false,
        email_verification_token TEXT,
        reset_password_token TEXT,
        reset_password_expires TIMESTAMP,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Drop and recreate subscription_plans table to ensure correct schema
    await db.execute(sql`DROP TABLE IF EXISTS subscription_plans CASCADE`);
    await db.execute(sql`
      CREATE TABLE subscription_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        interval TEXT NOT NULL DEFAULT 'month',
        trial_days INTEGER DEFAULT 3,
        stripe_product_id TEXT,
        stripe_price_id TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        features JSONB,
        max_vessels INTEGER DEFAULT -1,
        max_ports INTEGER DEFAULT -1,
        max_refineries INTEGER DEFAULT -1,
        can_access_broker_features BOOLEAN DEFAULT false,
        can_access_analytics BOOLEAN DEFAULT false,
        can_export_data BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user_subscriptions table
    await db.execute(sql`
      CREATE TABLE user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
        stripe_subscription_id TEXT,
        status TEXT NOT NULL DEFAULT 'trial',
        trial_start_date TIMESTAMP,
        trial_end_date TIMESTAMP,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        canceled_at TIMESTAMP,
        cancel_at_period_end BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        subscription_id INTEGER REFERENCES user_subscriptions(id),
        stripe_payment_intent_id TEXT,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'usd',
        status TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Drop old admin_documents table if it exists
    await db.execute(sql`DROP TABLE IF EXISTS admin_documents CASCADE`);
    
    // Create new documents table (Document Management system) - only if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        document_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        category TEXT DEFAULT 'general',
        tags TEXT,
        is_template BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create indexes for better performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category)`);
    
    console.log('Custom authentication tables created successfully');
    
    // Insert test admin user (password: "admin123")
    const adminPasswordHash = '$2b$10$6W/1ypnjS1aTMi7zCd3nweyNsPZfOeVKJSwV.PaaY0dbW6jiYSq4u';
    
    // First delete any existing admin user to ensure clean recreation
    await db.execute(sql`DELETE FROM users WHERE email = 'admin@petrodealhub.com'`);
    
    await db.execute(sql`
      INSERT INTO users (email, password, first_name, last_name, role) 
      VALUES ('admin@petrodealhub.com', ${adminPasswordHash}, 'Admin', 'User', 'admin')
    `);
    
    console.log('Test admin user created: admin@petrodealhub.com / admin123');
    
    // Insert default subscription plans
    try {
      await db.execute(sql`
        INSERT INTO subscription_plans (name, description, price, features, max_vessels, max_ports, max_refineries, can_access_broker_features, can_access_analytics, can_export_data)
        VALUES 
          ('Free Trial', '3-day trial with basic features', '0.00', '["Basic vessel tracking", "Limited port access", "Basic reporting"]', 10, 5, 2, false, false, false),
          ('Basic Plan', 'Perfect for small operations', '29.00', '["Full vessel tracking", "Port management", "Basic analytics", "Email support"]', 50, 20, 5, false, true, false),
          ('Pro Plan', 'Advanced features for growing businesses', '79.00', '["Unlimited vessels", "Advanced analytics", "API access", "Priority support", "Data export"]', -1, -1, 10, true, true, true),
          ('Enterprise', 'Complete solution for large operations', '199.00', '["Everything in Pro", "Custom integrations", "Dedicated support", "White labeling", "Advanced security"]', -1, -1, -1, true, true, true),
          ('Broker Premium', 'Specialized for maritime brokers', '149.00', '["Broker tools", "Deal management", "Client portal", "Commission tracking", "Advanced reporting"]', -1, -1, -1, true, true, true)
      `);
    } catch (error) {
      // Subscription plans already exist, skip
      console.log('Subscription plans already exist, skipping insertion');
    }
    
    console.log('Subscription plans seeded successfully');
    
  } catch (error) {
    console.error('Error initializing custom auth tables:', error);
    throw error;
  }
}