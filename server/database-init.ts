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

    // Create broker tables
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_deals (
          id SERIAL PRIMARY KEY,
          broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          seller_company_id INTEGER,
          buyer_company_id INTEGER,
          vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
          
          deal_title VARCHAR(255) NOT NULL,
          deal_description TEXT,
          cargo_type VARCHAR(100) NOT NULL,
          quantity DECIMAL(12,2) NOT NULL,
          quantity_unit VARCHAR(20) DEFAULT 'MT',
          price_per_unit DECIMAL(10,2) NOT NULL,
          total_value DECIMAL(15,2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'USD',
          
          status VARCHAR(50) DEFAULT 'draft',
          priority VARCHAR(20) DEFAULT 'medium',
          commission_rate DECIMAL(5,4) DEFAULT 0.015,
          commission_amount DECIMAL(12,2),
          
          origin_port VARCHAR(255),
          destination_port VARCHAR(255),
          departure_date DATE,
          arrival_date DATE,
          
          progress_percentage INTEGER DEFAULT 0,
          completion_date DATE,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_documents (
          id SERIAL PRIMARY KEY,
          broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE,
          
          document_name VARCHAR(255) NOT NULL,
          document_type VARCHAR(100) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type VARCHAR(100),
          
          description TEXT,
          version VARCHAR(20) DEFAULT '1.0',
          status VARCHAR(50) DEFAULT 'active',
          confidentiality_level VARCHAR(20) DEFAULT 'standard',
          
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_accessed TIMESTAMP,
          download_count INTEGER DEFAULT 0,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_admin_files (
          id SERIAL PRIMARY KEY,
          
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type VARCHAR(100),
          
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) DEFAULT 'general',
          priority VARCHAR(20) DEFAULT 'normal',
          
          target_brokers TEXT,
          requires_acknowledgment BOOLEAN DEFAULT FALSE,
          expiry_date DATE,
          
          status VARCHAR(50) DEFAULT 'active',
          created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_admin_file_acknowledgments (
          id SERIAL PRIMARY KEY,
          file_id INTEGER NOT NULL REFERENCES broker_admin_files(id) ON DELETE CASCADE,
          broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          
          read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          acknowledged_at TIMESTAMP,
          notes TEXT,
          
          UNIQUE(file_id, broker_id)
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_stats (
          id SERIAL PRIMARY KEY,
          broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          
          total_deals INTEGER DEFAULT 0,
          active_deals INTEGER DEFAULT 0,
          completed_deals INTEGER DEFAULT 0,
          cancelled_deals INTEGER DEFAULT 0,
          
          total_revenue DECIMAL(15,2) DEFAULT 0,
          total_commission DECIMAL(15,2) DEFAULT 0,
          average_deal_value DECIMAL(12,2) DEFAULT 0,
          
          success_rate DECIMAL(5,2) DEFAULT 0,
          average_deal_duration INTEGER DEFAULT 0,
          client_satisfaction_score DECIMAL(3,2) DEFAULT 0,
          
          documents_uploaded INTEGER DEFAULT 0,
          last_activity_date TIMESTAMP,
          
          stats_period VARCHAR(20) DEFAULT 'all_time',
          period_start_date DATE,
          period_end_date DATE,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          UNIQUE(broker_id, stats_period, period_start_date)
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          
          company_name VARCHAR(255),
          job_title VARCHAR(255),
          license_number VARCHAR(100),
          years_experience INTEGER,
          specializations TEXT,
          
          business_phone VARCHAR(50),
          business_email VARCHAR(255),
          business_address TEXT,
          website_url VARCHAR(255),
          linkedin_url VARCHAR(255),
          
          certifications TEXT,
          compliance_status VARCHAR(50) DEFAULT 'pending',
          last_compliance_check TIMESTAMP,
          
          rating DECIMAL(3,2) DEFAULT 0,
          total_ratings INTEGER DEFAULT 0,
          verified_broker BOOLEAN DEFAULT FALSE,
          premium_member BOOLEAN DEFAULT FALSE,
          
          notification_preferences TEXT,
          timezone VARCHAR(50) DEFAULT 'UTC',
          language_preference VARCHAR(10) DEFAULT 'en',
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          UNIQUE(user_id)
        )
      `);

      console.log("All broker tables created successfully");
    } catch (error) {
      console.log('Broker tables creation skipped:', error);
    }
    
    // Ensure enhanced profile columns exist
    try {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS username TEXT,
        ADD COLUMN IF NOT EXISTS phone_number TEXT,
        ADD COLUMN IF NOT EXISTS company TEXT,
        ADD COLUMN IF NOT EXISTS job_title TEXT,
        ADD COLUMN IF NOT EXISTS country TEXT,
        ADD COLUMN IF NOT EXISTS timezone TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS website TEXT,
        ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
        ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
        ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS weekly_reports BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
      `);
      
      console.log('Enhanced profile columns ensured');
    } catch (error) {
      console.log('Profile columns setup skipped:', error.message);
    }
    
  } catch (error) {
    console.error('Error initializing custom auth tables:', error);
    throw error;
  }
}