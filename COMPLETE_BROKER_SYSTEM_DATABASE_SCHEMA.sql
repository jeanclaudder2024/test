-- ============================================================================
-- COMPLETE BROKER SYSTEM DATABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor to ensure all broker tables exist
-- ============================================================================

-- 1. USERS TABLE - ADD BROKER MEMBERSHIP FIELDS
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_broker_membership BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_membership_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS broker_membership_payment_id TEXT;

-- 2. BROKER DEALS TABLE
CREATE TABLE IF NOT EXISTS broker_deals (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES real_companies(id),
  
  -- Deal Information
  deal_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  deal_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  oil_type TEXT,
  quantity DECIMAL(15,2) DEFAULT 0,
  price_per_unit DECIMAL(10,2) DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  
  -- Deal Status and Progress
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'rejected')),
  deal_status TEXT DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_step INTEGER DEFAULT 1,
  overall_progress INTEGER DEFAULT 0,
  
  -- Dates
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_close_date TIMESTAMP,
  actual_close_date TIMESTAMP,
  
  -- Financial Details
  commission_rate DECIMAL(5,2) DEFAULT 0,
  broker_commission DECIMAL(15,2) DEFAULT 0,
  
  -- Contact and Location
  origin_port TEXT,
  destination_port TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Deal Specifications
  cargo_type TEXT,
  cargo_specifications TEXT,
  delivery_terms TEXT,
  payment_terms TEXT,
  contract_type TEXT,
  vessel_requirements TEXT,
  insurance_details TEXT,
  special_conditions TEXT,
  
  -- Deal Management
  admin_approved BOOLEAN DEFAULT FALSE,
  admin_comments TEXT,
  rejection_reason TEXT,
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
  
  -- Internal Management
  internal_notes TEXT,
  client_communication_log TEXT,
  transaction_type TEXT DEFAULT 'CIF-ASWP',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_broker_deals_broker_id (broker_id),
  INDEX idx_broker_deals_status (status),
  INDEX idx_broker_deals_company_id (company_id),
  INDEX idx_broker_deals_start_date (start_date)
);

-- 3. BROKER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS broker_documents (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE,
  
  -- Document Details
  document_name TEXT NOT NULL,
  original_name TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  file_type TEXT,
  mime_type TEXT,
  
  -- Document Classification
  document_type TEXT DEFAULT 'general' CHECK (document_type IN ('contract', 'invoice', 'certificate', 'report', 'correspondence', 'general')),
  category TEXT DEFAULT 'deal_document',
  
  -- Document Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  is_confidential BOOLEAN DEFAULT FALSE,
  
  -- Access Control
  access_level TEXT DEFAULT 'broker' CHECK (access_level IN ('public', 'broker', 'admin_only')),
  
  -- Document Tracking
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER REFERENCES users(id),
  download_count INTEGER DEFAULT 0,
  last_downloaded TIMESTAMP,
  
  -- Document Metadata
  description TEXT,
  tags TEXT,
  version INTEGER DEFAULT 1,
  
  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_broker_documents_broker_id (broker_id),
  INDEX idx_broker_documents_deal_id (deal_id),
  INDEX idx_broker_documents_type (document_type),
  INDEX idx_broker_documents_uploaded_by (uploaded_by)
);

-- 4. BROKER ADMIN FILES TABLE (Files sent by admin to brokers)
CREATE TABLE IF NOT EXISTS broker_admin_files (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id INTEGER REFERENCES broker_deals(id) ON DELETE CASCADE,
  
  -- File Details
  file_name TEXT NOT NULL,
  original_name TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  file_type TEXT,
  description TEXT,
  
  -- File Management
  sent_by INTEGER NOT NULL REFERENCES users(id),
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Read Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- File Classification
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_broker_admin_files_broker_id (broker_id),
  INDEX idx_broker_admin_files_sent_by (sent_by),
  INDEX idx_broker_admin_files_deal_id (deal_id),
  INDEX idx_broker_admin_files_read_status (is_read)
);

-- 5. BROKER STATS TABLE
CREATE TABLE IF NOT EXISTS broker_stats (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Deal Statistics
  total_deals INTEGER DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  cancelled_deals INTEGER DEFAULT 0,
  
  -- Financial Statistics
  total_revenue DECIMAL(15,2) DEFAULT 0.00,
  total_commission DECIMAL(15,2) DEFAULT 0.00,
  average_deal_value DECIMAL(12,2) DEFAULT 0.00,
  
  -- Performance Metrics
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  average_deal_duration INTEGER DEFAULT 0,
  client_satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
  
  -- Activity Metrics
  documents_uploaded INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP,
  
  -- Time Period Tracking
  stats_period VARCHAR(20) DEFAULT 'all_time',
  period_start_date TIMESTAMP,
  period_end_date TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique stats per broker per period
  UNIQUE(broker_id, stats_period, period_start_date),
  
  -- Indexes
  INDEX idx_broker_stats_broker_id (broker_id),
  INDEX idx_broker_stats_period (stats_period),
  INDEX idx_broker_stats_updated_at (updated_at)
);

-- 6. TRANSACTION STEPS TABLE (For CIF-ASWP workflow)
CREATE TABLE IF NOT EXISTS transaction_steps (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  
  -- Step Information
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_description TEXT,
  
  -- Step Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'skipped')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Step Management
  assigned_to INTEGER REFERENCES users(id),
  responsible_party TEXT, -- 'buyer', 'seller', 'broker', 'admin'
  
  -- Dates and Timeline
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  completed_date TIMESTAMP,
  
  -- Step Details
  requirements TEXT,
  notes TEXT,
  admin_feedback TEXT,
  rejection_reason TEXT,
  
  -- Document Requirements
  required_documents TEXT,
  documents_received INTEGER DEFAULT 0,
  documents_required INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(deal_id, step_number),
  
  -- Indexes
  INDEX idx_transaction_steps_deal_id (deal_id),
  INDEX idx_transaction_steps_status (status),
  INDEX idx_transaction_steps_assigned_to (assigned_to),
  INDEX idx_transaction_steps_step_number (step_number)
);

-- 7. TRANSACTION DOCUMENTS TABLE (Documents for specific transaction steps)
CREATE TABLE IF NOT EXISTS transaction_documents (
  id SERIAL PRIMARY KEY,
  step_id INTEGER NOT NULL REFERENCES transaction_steps(id) ON DELETE CASCADE,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  
  -- Document Details
  document_name TEXT NOT NULL,
  original_name TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  file_type TEXT,
  
  -- Document Management
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Document Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requires_revision')),
  admin_approved BOOLEAN DEFAULT FALSE,
  admin_comments TEXT,
  
  -- Document Classification
  document_type TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_transaction_documents_step_id (step_id),
  INDEX idx_transaction_documents_deal_id (deal_id),
  INDEX idx_transaction_documents_uploaded_by (uploaded_by),
  INDEX idx_transaction_documents_status (status)
);

-- 8. DEAL MESSAGES TABLE (Communication between broker and admin)
CREATE TABLE IF NOT EXISTS deal_messages (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
  
  -- Message Details
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  message_type TEXT DEFAULT 'general' CHECK (message_type IN ('general', 'inquiry', 'update', 'request', 'notification')),
  
  -- Message Content
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Message Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Message Classification
  sender_type TEXT CHECK (sender_type IN ('broker', 'admin', 'system')),
  
  -- Attachments
  has_attachments BOOLEAN DEFAULT FALSE,
  attachment_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_deal_messages_deal_id (deal_id),
  INDEX idx_deal_messages_sender_id (sender_id),
  INDEX idx_deal_messages_receiver_id (receiver_id),
  INDEX idx_deal_messages_read_status (is_read),
  INDEX idx_deal_messages_created_at (created_at)
);

-- 9. BROKER PROFILES TABLE (Extended broker information)
CREATE TABLE IF NOT EXISTS broker_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional Information
  company_name TEXT,
  business_registration_number TEXT,
  license_number TEXT,
  years_of_experience INTEGER DEFAULT 0,
  specialization TEXT,
  
  -- Contact Information
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  website_url TEXT,
  linkedin_profile TEXT,
  
  -- Professional Details
  certifications TEXT,
  languages_spoken TEXT,
  preferred_regions TEXT,
  preferred_oil_types TEXT,
  
  -- Business Capabilities
  minimum_deal_size DECIMAL(15,2),
  maximum_deal_size DECIMAL(15,2),
  commission_rate_preference DECIMAL(5,2),
  
  -- Profile Status
  profile_completion_percentage INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_date TIMESTAMP,
  
  -- Profile Settings
  is_public BOOLEAN DEFAULT FALSE,
  accepts_new_deals BOOLEAN DEFAULT TRUE,
  notification_preferences TEXT,
  
  -- Additional Information
  bio TEXT,
  professional_references TEXT,
  bank_details_provided BOOLEAN DEFAULT FALSE,
  
  -- Preferences
  preferred_currency TEXT DEFAULT 'USD',
  time_zone TEXT,
  language_preference VARCHAR(10) DEFAULT 'en',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(user_id),
  
  -- Indexes
  INDEX idx_broker_profiles_user_id (user_id),
  INDEX idx_broker_profiles_verification_status (verification_status),
  INDEX idx_broker_profiles_specialization (specialization)
);

-- 10. BROKER CARD APPLICATIONS TABLE (Membership card requests)
CREATE TABLE IF NOT EXISTS broker_card_applications (
  id SERIAL PRIMARY KEY,
  submitted_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Application Details
  membership_id TEXT UNIQUE,
  card_number TEXT UNIQUE,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  nationality TEXT,
  passport_number TEXT,
  
  -- Professional Information
  industry_experience INTEGER DEFAULT 0,
  previous_employer TEXT,
  specialization TEXT,
  certifications TEXT,
  
  -- Address Information
  current_location TEXT,
  residence_address TEXT,
  
  -- Application Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Card Information
  card_type TEXT DEFAULT 'Professional Oil Broker',
  expiry_date DATE,
  
  -- File Uploads
  passport_photo_path TEXT,
  
  -- Metadata
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_broker_card_applications_submitted_by (submitted_by),
  INDEX idx_broker_card_applications_status (status),
  INDEX idx_broker_card_applications_membership_id (membership_id)
);

-- ============================================================================
-- VERIFICATION QUERIES - Run these to check if all tables were created correctly
-- ============================================================================

-- Check if users table has broker membership fields
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('has_broker_membership', 'broker_membership_date', 'broker_membership_payment_id')
ORDER BY column_name;

-- Check all broker-related tables exist
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name IN (
  'broker_deals', 
  'broker_documents', 
  'broker_admin_files', 
  'broker_stats', 
  'transaction_steps', 
  'transaction_documents', 
  'deal_messages', 
  'broker_profiles', 
  'broker_card_applications'
)
ORDER BY table_name;

-- Count records in each broker table
SELECT 
  'broker_deals' as table_name, COUNT(*) as record_count FROM broker_deals
UNION ALL SELECT 
  'broker_documents' as table_name, COUNT(*) as record_count FROM broker_documents
UNION ALL SELECT 
  'broker_admin_files' as table_name, COUNT(*) as record_count FROM broker_admin_files
UNION ALL SELECT 
  'broker_stats' as table_name, COUNT(*) as record_count FROM broker_stats
UNION ALL SELECT 
  'transaction_steps' as table_name, COUNT(*) as record_count FROM transaction_steps
UNION ALL SELECT 
  'transaction_documents' as table_name, COUNT(*) as record_count FROM transaction_documents
UNION ALL SELECT 
  'deal_messages' as table_name, COUNT(*) as record_count FROM deal_messages
UNION ALL SELECT 
  'broker_profiles' as table_name, COUNT(*) as record_count FROM broker_profiles
UNION ALL SELECT 
  'broker_card_applications' as table_name, COUNT(*) as record_count FROM broker_card_applications;

-- ============================================================================
-- SAMPLE DATA INSERT (Optional - for testing)
-- ============================================================================

-- Grant broker membership to admin user for testing
UPDATE users 
SET 
  has_broker_membership = TRUE,
  broker_membership_date = NOW(),
  broker_membership_payment_id = 'manual_admin_grant'
WHERE email = 'admin@petrodealhub.com' AND has_broker_membership = FALSE;

-- Verify admin user has broker access
SELECT id, email, role, has_broker_membership, broker_membership_date 
FROM users 
WHERE email = 'admin@petrodealhub.com';