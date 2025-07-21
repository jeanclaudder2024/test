-- =================================================================
-- COMPLETE PAYMENT & PROFILE DATABASE SCHEMA
-- This includes all payment processing, user profiles, and broker deals
-- Copy and paste this entire script into your Supabase SQL Editor
-- =================================================================

-- =================================================================
-- 1. PAYMENT SYSTEM TABLES
-- =================================================================

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Trial management
  is_trial BOOLEAN DEFAULT false,
  trial_expired BOOLEAN DEFAULT false,
  
  UNIQUE(user_id, plan_id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE,
  type VARCHAR(50) NOT NULL,
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES user_subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount_due DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  invoice_pdf_url TEXT,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Broker Membership Payments (One-time $299 payment)
CREATE TABLE IF NOT EXISTS broker_membership_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) DEFAULT 299.00,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  membership_activated_at TIMESTAMP,
  card_number_generated TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- 2. USER PROFILE ENHANCEMENTS
-- =================================================================

-- Add broker membership columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_broker_membership BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS broker_membership_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS broker_membership_payment_id TEXT,
ADD COLUMN IF NOT EXISTS broker_membership_amount DECIMAL(10,2) DEFAULT 299.00,
ADD COLUMN IF NOT EXISTS broker_card_status TEXT DEFAULT 'not_applied',
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS notification_preferences TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS company_affiliation TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- User Profiles Extended Table
CREATE TABLE IF NOT EXISTS user_profiles_extended (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional Information
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  department VARCHAR(255),
  years_experience INTEGER,
  specializations TEXT,
  certifications TEXT,
  license_numbers TEXT,
  
  -- Contact Information
  business_phone VARCHAR(50),
  business_email VARCHAR(255),
  business_address TEXT,
  website_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  
  -- Preferences
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT false,
  notification_marketing BOOLEAN DEFAULT true,
  
  -- Profile Status
  profile_completion_percentage INTEGER DEFAULT 0,
  verification_status VARCHAR(50) DEFAULT 'pending',
  last_profile_update TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

-- =================================================================
-- 3. BROKER DEALS AND TRANSACTION SYSTEM
-- =================================================================

-- Broker Deals Table (Enhanced for Profile Integration)
CREATE TABLE IF NOT EXISTS broker_deals (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_company_id INTEGER,
  buyer_company_id INTEGER,
  vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
  
  -- Deal Information
  deal_title VARCHAR(255) NOT NULL,
  deal_description TEXT,
  cargo_type VARCHAR(100) NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  quantity_unit VARCHAR(20) DEFAULT 'MT',
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  
  -- Status Management (BOTH COLUMNS FOR COMPATIBILITY)
  status VARCHAR(50) DEFAULT 'draft',
  deal_status VARCHAR(50) DEFAULT 'draft',
  
  -- Financial Information
  priority VARCHAR(20) DEFAULT 'medium',
  commission_rate DECIMAL(5, 4) DEFAULT 0.0150,
  commission_amount DECIMAL(12, 2),
  broker_fee DECIMAL(10, 2),
  payment_terms VARCHAR(255),
  insurance_requirements TEXT,
  
  -- Location and Timing
  origin_port VARCHAR(255),
  destination_port VARCHAR(255),
  departure_date TIMESTAMP,
  arrival_date TIMESTAMP,
  estimated_completion_date DATE,
  
  -- Progress Tracking
  progress_percentage INTEGER DEFAULT 0,
  completion_date TIMESTAMP,
  current_step INTEGER DEFAULT 1,
  transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP',
  overall_progress DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Risk and Compliance
  risk_assessment VARCHAR(50) DEFAULT 'low',
  compliance_status VARCHAR(50) DEFAULT 'pending',
  document_count INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  assigned_admin_id INTEGER REFERENCES users(id),
  
  -- Additional Tracking
  deal_source VARCHAR(100) DEFAULT 'platform',
  geographic_region VARCHAR(100),
  vessel_type VARCHAR(100),
  cargo_specifications TEXT,
  delivery_terms VARCHAR(100),
  special_conditions TEXT,
  internal_notes TEXT,
  client_communication_log TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Deal Messages Table (Broker Communication)
CREATE TABLE IF NOT EXISTS deal_messages (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  is_system_message BOOLEAN DEFAULT false,
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Steps Table (8-step CIF-ASWP workflow)
CREATE TABLE IF NOT EXISTS transaction_steps (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  admin_notes TEXT,
  rejection_reason TEXT,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Documents Table
CREATE TABLE IF NOT EXISTS transaction_documents (
  id SERIAL PRIMARY KEY,
  step_id INTEGER NOT NULL REFERENCES transaction_steps(id) ON DELETE CASCADE,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_status VARCHAR(50) DEFAULT 'pending',
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  version_number INTEGER DEFAULT 1
);

-- =================================================================
-- 4. BROKER CARD APPLICATIONS SYSTEM
-- =================================================================

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

-- =================================================================
-- 5. BROKER SUPPORT TABLES
-- =================================================================

-- Broker Documents Table
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
);

-- Broker Stats Table
CREATE TABLE IF NOT EXISTS broker_stats (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  total_deals INTEGER DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  cancelled_deals INTEGER DEFAULT 0,
  
  total_revenue DECIMAL(15, 2) DEFAULT 0.00,
  total_commission DECIMAL(15, 2) DEFAULT 0.00,
  average_deal_value DECIMAL(12, 2) DEFAULT 0.00,
  
  success_rate DECIMAL(5, 2) DEFAULT 0.00,
  average_deal_duration INTEGER DEFAULT 0,
  client_satisfaction_score DECIMAL(3, 2) DEFAULT 0.00,
  
  documents_uploaded INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  
  stats_period VARCHAR(20) DEFAULT 'all_time',
  period_start_date TIMESTAMP,
  period_end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- 6. CRITICAL COLUMN FIXES
-- =================================================================

-- Ensure all critical columns exist
ALTER TABLE broker_deals 
ADD COLUMN IF NOT EXISTS deal_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP',
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS overall_progress DECIMAL(5, 2) DEFAULT 0.00;

ALTER TABLE deal_messages 
ADD COLUMN IF NOT EXISTS receiver_id INTEGER REFERENCES users(id);

-- Sync status columns in broker_deals
UPDATE broker_deals SET deal_status = status WHERE deal_status IS NULL AND status IS NOT NULL;
UPDATE broker_deals SET status = deal_status WHERE status IS NULL AND deal_status IS NOT NULL;
UPDATE broker_deals SET deal_status = 'draft' WHERE deal_status IS NULL;
UPDATE broker_deals SET status = 'draft' WHERE status IS NULL;

-- =================================================================
-- 7. PERFORMANCE INDEXES
-- =================================================================

-- Payment System Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_broker_membership_payments_user_id ON broker_membership_payments(user_id);

-- User Profile Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_broker_membership ON users(has_broker_membership);

-- Broker Deal Indexes
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_deal_status ON broker_deals(deal_status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_vessel_id ON broker_deals(vessel_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_created_at ON broker_deals(created_at);

-- Transaction Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_status ON transaction_steps(status);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);

-- Communication Indexes
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_sender_id ON deal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_receiver_id ON deal_messages(receiver_id);

-- Broker Support Indexes
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_submitted_by ON broker_card_applications(submitted_by);
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_status ON broker_card_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_broker_documents_broker_id ON broker_documents(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_stats_broker_id ON broker_stats(broker_id);

-- =================================================================
-- 8. VERIFICATION QUERIES
-- =================================================================

-- Verify Payment Tables
SELECT 
  'PAYMENT SYSTEM ✅' as system_status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_subscriptions',
  'payments',
  'payment_methods', 
  'invoices',
  'broker_membership_payments'
);

-- Verify Broker System Tables
SELECT 
  'BROKER SYSTEM ✅' as system_status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'broker_deals',
  'deal_messages',
  'transaction_steps',
  'transaction_documents',
  'broker_card_applications',
  'broker_documents',
  'broker_stats'
);

-- Verify Critical Columns
SELECT 
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ ALL CRITICAL COLUMNS EXIST'
    ELSE '❌ MISSING COLUMNS - CHECK ERRORS'
  END as column_status,
  COUNT(*) as found_columns
FROM information_schema.columns
WHERE (table_name = 'broker_deals' AND column_name IN ('status', 'deal_status', 'transaction_type', 'current_step'))
   OR (table_name = 'deal_messages' AND column_name = 'receiver_id')
   OR (table_name = 'users' AND column_name = 'stripe_customer_id');

-- Final Success Message
SELECT 
  '🎉 COMPLETE DATABASE SCHEMA APPLIED SUCCESSFULLY! 🎉' as final_status,
  'Payment system, user profiles, and broker deals are ready!' as details;