-- Create broker card applications table
CREATE TABLE IF NOT EXISTS broker_card_applications (
  id SERIAL PRIMARY KEY,
  submitted_by INTEGER NOT NULL REFERENCES users(id),
  
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
  references TEXT,
  
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_submitted_by ON broker_card_applications(submitted_by);
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_status ON broker_card_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_broker_card_applications_submitted_at ON broker_card_applications(submitted_at);