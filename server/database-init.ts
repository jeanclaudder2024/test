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

    // Add broker membership columns to users table with snake_case column names matching schema
    try {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS has_broker_membership BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS broker_membership_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS broker_membership_payment_id TEXT;
      `);
      console.log('Broker membership columns added to users table');
    } catch (error) {
      console.log('Broker membership columns already exist or error:', error);
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

      // Create broker admin files table (matches schema)
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_admin_files (
          id SERIAL PRIMARY KEY,
          file_name TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size TEXT NOT NULL,
          file_path TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL DEFAULT 'other',
          priority TEXT NOT NULL DEFAULT 'medium',
          sent_by TEXT NOT NULL,
          sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          broker_id INTEGER NOT NULL REFERENCES users(id),
          is_read BOOLEAN DEFAULT FALSE,
          read_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Add template access control columns
    try {
      await db.execute(sql`
        ALTER TABLE document_templates 
        ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS broker_only BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS basic_access BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS professional_access BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS enterprise_access BOOLEAN DEFAULT true;
      `);
      
      console.log('Template access control columns ensured');
    } catch (error) {
      console.log('Template access control columns setup skipped:', error.message);
    }

    // Clean up any existing templates with broker_only = true (no longer used)
    try {
      await db.execute(sql`
        UPDATE document_templates 
        SET broker_only = false 
        WHERE broker_only = true;
      `);
      
      console.log('Cleaned up existing templates with broker_only access');
    } catch (error) {
      console.log('Template broker access cleanup skipped:', error.message);
    }

    // Create landing page images table
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS landing_page_images (
          id SERIAL PRIMARY KEY,
          section TEXT NOT NULL,
          image_key VARCHAR(100) NOT NULL,
          image_url TEXT,
          alt_text VARCHAR(255),
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(section, image_key)
        );
      `);
      
      // Insert sample images if table is empty
      const existingImages = await db.execute(sql`SELECT COUNT(*) as count FROM landing_page_images`);
      const count = existingImages.rows[0]?.count || 0;
      
      if (count === 0) {
        await db.execute(sql`
          INSERT INTO landing_page_images (section, image_key, image_url, alt_text, display_order, is_active) VALUES
          ('hero', 'hero-background', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070', 'Maritime oil tanker at sea', 1, true),
          ('industry', 'oil-refinery', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=2125', 'Modern oil refinery facility', 1, true),
          ('features', 'vessel-tracking', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070', 'Vessel tracking technology', 1, true),
          ('how-it-works', 'platform-workflow', 'https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=2070', 'Digital platform workflow', 1, true);
        `);
        console.log('Landing page images table created with sample data');
      } else {
        console.log('Landing page images table already exists with data');
      }
    } catch (error) {
      console.log('Landing page images table setup skipped:', error.message);
    }

    // Ensure transaction progress tables are created
    try {
      await storage.ensureTransactionTables();
    } catch (error) {
      console.log('Transaction tables setup skipped:', error.message);
    }

    // Create broker admin files table
    try {
      // First drop and recreate the table
      await db.execute(sql`
        DROP TABLE IF EXISTS broker_admin_files CASCADE;
      `);
      
      await db.execute(sql`
        CREATE TABLE broker_admin_files (
          id SERIAL PRIMARY KEY,
          broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          file_size VARCHAR(50) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          sent_date TIMESTAMP DEFAULT NOW(),
          sent_by VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL DEFAULT 'other',
          priority VARCHAR(20) NOT NULL DEFAULT 'medium',
          is_read BOOLEAN DEFAULT false,
          read_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('Broker admin files table created successfully');
    } catch (error) {
      console.log('Broker admin files table setup failed:', error.message);
    }

    // Create broker card applications table
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS broker_card_applications (
          id SERIAL PRIMARY KEY,
          submitted_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          
          -- Personal Information
          full_name TEXT NOT NULL,
          date_of_birth TEXT NOT NULL,
          nationality TEXT NOT NULL,
          passport_number TEXT NOT NULL,
          passport_expiry TEXT NOT NULL,
          place_of_birth TEXT,
          gender TEXT,
          marital_status TEXT,
          
          -- Contact Information
          street_address TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT,
          postal_code TEXT,
          country TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          alternate_phone TEXT,
          emergency_contact TEXT,
          emergency_phone TEXT,
          
          -- Professional Information
          company_name TEXT NOT NULL,
          job_title TEXT NOT NULL,
          years_experience TEXT NOT NULL,
          previous_licenses TEXT,
          specializations TEXT,
          business_address TEXT,
          business_phone TEXT,
          business_email TEXT,
          linkedin_profile TEXT,
          professional_references TEXT,
          
          -- Document Paths
          passport_photo_path TEXT,
          passport_document_path TEXT,
          
          -- Application Status
          application_status TEXT NOT NULL DEFAULT 'pending',
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reviewed_at TIMESTAMP,
          reviewed_by INTEGER REFERENCES users(id),
          admin_notes TEXT,
          card_generated_at TIMESTAMP,
          card_number TEXT,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for performance
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_broker_card_applications_submitted_by 
        ON broker_card_applications(submitted_by);
      `);
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_broker_card_applications_status 
        ON broker_card_applications(application_status);
      `);
      
      console.log('Broker card applications table created successfully');
    } catch (error) {
      console.log('Broker card applications table setup failed:', error.message);
    }

    // Fix broker_deals table to add missing deal_status column
    try {
      await db.execute(sql`
        ALTER TABLE broker_deals 
        ADD COLUMN IF NOT EXISTS deal_status VARCHAR(50) DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP';
      `);
      
      // Sync the status columns
      await db.execute(sql`
        UPDATE broker_deals 
        SET deal_status = status 
        WHERE deal_status IS NULL AND status IS NOT NULL;
      `);
      
      await db.execute(sql`
        UPDATE broker_deals 
        SET status = deal_status 
        WHERE status IS NULL AND deal_status IS NOT NULL;
      `);
      
      console.log('Broker deals table enhanced with missing columns');
    } catch (error) {
      console.log('Broker deals enhancement skipped:', error.message);
    }

    // Fix deal_messages table to add missing receiver_id column
    try {
      await db.execute(sql`
        ALTER TABLE deal_messages 
        ADD COLUMN IF NOT EXISTS receiver_id INTEGER REFERENCES users(id);
      `);
      
      console.log('Deal messages table enhanced with receiver_id column');
    } catch (error) {
      console.log('Deal messages enhancement skipped:', error.message);
    }
    
  } catch (error) {
    console.error('Error initializing custom auth tables:', error);
    throw error;
  }
}