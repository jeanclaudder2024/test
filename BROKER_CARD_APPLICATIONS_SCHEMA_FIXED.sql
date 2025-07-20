-- Broker Card Applications Table Schema
-- Fixed version with proper PostgreSQL syntax

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_submitted_by 
ON broker_card_applications(submitted_by);

CREATE INDEX IF NOT EXISTS idx_broker_card_applications_status 
ON broker_card_applications(application_status);

-- Sample data insert (optional)
-- INSERT INTO broker_card_applications (
--   submitted_by, full_name, date_of_birth, nationality, passport_number, 
--   passport_expiry, street_address, city, country, phone_number, 
--   company_name, job_title, years_experience
-- ) VALUES (
--   1, 'John Doe', '1990-01-01', 'American', 'US123456789', 
--   '2030-01-01', '123 Main St', 'New York', 'USA', '+1-555-0123',
--   'Maritime Corp', 'Broker', '5 years'
-- );