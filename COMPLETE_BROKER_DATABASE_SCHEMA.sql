-- COMPLETE BROKER SUBSCRIPTION AND MANAGEMENT DATABASE SCHEMA
-- This file contains all broker-related tables for the PetroDealHub platform

-- ========================================
-- 1. BROKER CARD APPLICATIONS TABLE
-- ========================================
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

-- ========================================
-- 2. BROKER DEALS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS broker_deals (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_company_id INTEGER,
  buyer_company_id INTEGER,
  vessel_id INTEGER REFERENCES vessels(id) ON DELETE SET NULL,
  
  deal_title VARCHAR(255) NOT NULL,
  deal_description TEXT,
  cargo_type VARCHAR(100) NOT NULL,
  quantity DECIMAL(12, 2) NOT NULL,
  quantity_unit VARCHAR(20) DEFAULT 'MT',
  price_per_unit DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  
  deal_status VARCHAR(50) DEFAULT 'draft',
  priority_level VARCHAR(20) DEFAULT 'medium',
  progress_percentage INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 1,
  overall_progress INTEGER DEFAULT 0,
  
  origin_port VARCHAR(255),
  destination_port VARCHAR(255),
  loading_date DATE,
  delivery_date DATE,
  contract_type VARCHAR(100),
  commission_rate DECIMAL(5, 2) DEFAULT 5.00,
  commission_amount DECIMAL(12, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Enhanced fields
  estimated_completion_date DATE,
  risk_assessment VARCHAR(50) DEFAULT 'low',
  compliance_status VARCHAR(50) DEFAULT 'pending',
  document_count INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  assigned_admin_id INTEGER REFERENCES users(id),
  deal_source VARCHAR(100) DEFAULT 'platform',
  geographic_region VARCHAR(100),
  vessel_type VARCHAR(100),
  cargo_specifications TEXT,
  delivery_terms VARCHAR(100),
  payment_terms VARCHAR(100),
  insurance_details TEXT,
  special_conditions TEXT,
  internal_notes TEXT,
  client_communication_log TEXT
);

-- ========================================
-- 3. TRANSACTION STEPS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS transaction_steps (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  step_description TEXT,
  step_status VARCHAR(50) DEFAULT 'pending',
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP,
  assigned_to INTEGER REFERENCES users(id),
  estimated_duration INTEGER, -- in hours
  actual_duration INTEGER, -- in hours
  required_documents TEXT, -- JSON array of required documents
  completion_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. TRANSACTION DOCUMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS transaction_documents (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  step_id INTEGER REFERENCES transaction_steps(id) ON DELETE SET NULL,
  document_name VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  document_type VARCHAR(100),
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_status VARCHAR(50) DEFAULT 'pending',
  verification_status VARCHAR(50) DEFAULT 'unverified',
  verified_by INTEGER REFERENCES users(id),
  verification_date TIMESTAMP,
  document_notes TEXT
);

-- ========================================
-- 5. DEAL MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS deal_messages (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 6. DEAL MESSAGE ATTACHMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS deal_message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES deal_messages(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 7. BROKER DOCUMENTS TABLE
-- ========================================
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

-- ========================================
-- 8. BROKER ADMIN FILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS broker_admin_files (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size VARCHAR(50) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_by VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 9. BROKER STATS TABLE
-- ========================================
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

-- ========================================
-- 10. BROKER PROFILES TABLE
-- ========================================
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
  
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  verified_broker BOOLEAN DEFAULT false,
  premium_member BOOLEAN DEFAULT false,
  
  notification_preferences TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language_preference VARCHAR(10) DEFAULT 'en',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Broker Card Applications Indexes
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_submitted_by ON broker_card_applications(submitted_by);
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_status ON broker_card_applications(application_status);

-- Broker Deals Indexes
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(deal_status);
CREATE INDEX IF NOT EXISTS idx_broker_deals_vessel_id ON broker_deals(vessel_id);

-- Transaction Steps Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_steps_deal_id ON transaction_steps(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_steps_status ON transaction_steps(step_status);

-- Transaction Documents Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_documents_deal_id ON transaction_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_documents_step_id ON transaction_documents(step_id);

-- Deal Messages Indexes
CREATE INDEX IF NOT EXISTS idx_deal_messages_deal_id ON deal_messages(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_sender_id ON deal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_deal_messages_receiver_id ON deal_messages(receiver_id);

-- Broker Documents Indexes
CREATE INDEX IF NOT EXISTS idx_broker_documents_broker_id ON broker_documents(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_documents_deal_id ON broker_documents(deal_id);

-- Broker Admin Files Indexes
CREATE INDEX IF NOT EXISTS idx_broker_admin_files_broker_id ON broker_admin_files(broker_id);

-- Broker Stats Indexes
CREATE INDEX IF NOT EXISTS idx_broker_stats_broker_id ON broker_stats(broker_id);

-- Broker Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_broker_profiles_user_id ON broker_profiles(user_id);

-- ========================================
-- CHECK IF TABLES EXIST QUERIES
-- ========================================

-- Use these queries to check if tables exist:
/*
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'broker_card_applications',
  'broker_deals', 
  'transaction_steps',
  'transaction_documents',
  'deal_messages',
  'deal_message_attachments',
  'broker_documents',
  'broker_admin_files',
  'broker_stats',
  'broker_profiles'
);
*/

-- Check specific table structure:
/*
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'broker_card_applications'
ORDER BY ordinal_position;
*/