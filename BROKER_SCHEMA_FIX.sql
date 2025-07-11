-- Fix broker table columns that are missing
BEGIN;

-- Check and add missing columns to broker_deals table
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS seller_company_id INTEGER;
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS buyer_company_id INTEGER;

-- Check and add missing columns to broker_documents table  
ALTER TABLE broker_documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(255);

-- Check and add missing columns to broker_admin_files table
ALTER TABLE broker_admin_files ADD COLUMN IF NOT EXISTS broker_id INTEGER;

-- Create broker_deals table if it doesn't exist
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
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'medium',
  commission_rate DECIMAL(5, 4) DEFAULT 0.0150,
  commission_amount DECIMAL(12, 2),
  origin_port VARCHAR(255),
  destination_port VARCHAR(255),
  departure_date TIMESTAMP,
  arrival_date TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0,
  completion_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Create broker_documents table if it doesn't exist
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
  upload_date TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create broker_admin_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS broker_admin_files (
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
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create broker_stats table if it doesn't exist
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create broker_profiles table if it doesn't exist
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
  verified_broker BOOLEAN DEFAULT FALSE,
  premium_member BOOLEAN DEFAULT FALSE,
  notification_preferences TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language_preference VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMIT;