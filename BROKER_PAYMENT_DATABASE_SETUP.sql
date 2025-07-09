-- Manual Database Setup for Broker Payment System
-- Run these SQL commands in your Supabase SQL editor

-- 1. Create broker deals table
CREATE TABLE IF NOT EXISTS broker_deals (
  id SERIAL PRIMARY KEY,
  deal_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_id INTEGER,
  deal_value TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_close_date TIMESTAMP,
  oil_type TEXT,
  quantity TEXT,
  notes TEXT,
  documents_count INTEGER DEFAULT 0,
  broker_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create broker documents table
CREATE TABLE IF NOT EXISTS broker_documents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  size TEXT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  download_count INTEGER DEFAULT 0,
  deal_id INTEGER,
  is_admin_file BOOLEAN DEFAULT FALSE,
  broker_id INTEGER,
  file_path TEXT
);

-- 3. Create admin broker files table
CREATE TABLE IF NOT EXISTS admin_broker_files (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size TEXT,
  sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_by TEXT,
  description TEXT,
  category TEXT DEFAULT 'other' CHECK (category IN ('contract', 'compliance', 'legal', 'technical', 'other')),
  broker_id INTEGER,
  file_path TEXT
);

-- 4. Create broker payments table for membership tracking
CREATE TABLE IF NOT EXISTS broker_payments (
  id SERIAL PRIMARY KEY,
  broker_id INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  membership_start_date TIMESTAMP,
  membership_end_date TIMESTAMP,
  membership_card_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add new columns to existing brokers table
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'expired', 'cancelled'));
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMP;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS card_number TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS passport_photo TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS experience TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS previous_employer TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- 6. Insert sample broker deals for testing
INSERT INTO broker_deals (deal_title, company_name, company_id, deal_value, status, progress, oil_type, quantity, notes, broker_id) VALUES
('Crude Oil Supply Agreement', 'ExxonMobil Corporation', 1, '$2.5M', 'active', 75, 'Brent Crude', '50,000 barrels', 'Q1 2025 delivery', 1),
('Refined Products Deal', 'Shell Trading', 2, '$1.8M', 'pending', 25, 'Gasoline', '30,000 barrels', 'Pending approval', 1),
('Natural Gas Contract', 'BP Energy', 3, '$3.2M', 'active', 90, 'Natural Gas', '100,000 MMBtu', 'Near completion', 1),
('Heating Oil Distribution', 'Total Energies', 4, '$950K', 'completed', 100, 'Heating Oil', '15,000 barrels', 'Successfully delivered', 1),
('Diesel Fuel Agreement', 'Chevron Corporation', 5, '$1.2M', 'cancelled', 10, 'Diesel', '25,000 barrels', 'Contract cancelled', 1);

-- 7. Insert sample broker documents
INSERT INTO broker_documents (name, type, size, uploaded_by, deal_id, is_admin_file, broker_id) VALUES
('Supply Agreement.pdf', 'contract', '2.4 MB', 'John Broker', 1, false, 1),
('Quality Certificate.pdf', 'certificate', '1.2 MB', 'Admin', 1, true, 1),
('Shipping Documentation.docx', 'shipping', '856 KB', 'John Broker', 2, false, 1),
('Insurance Policy.pdf', 'insurance', '3.1 MB', 'Admin', 3, true, 1),
('Delivery Receipt.pdf', 'receipt', '524 KB', 'John Broker', 4, false, 1);

-- 8. Insert sample admin files
INSERT INTO admin_broker_files (file_name, file_type, file_size, sent_by, description, category, broker_id) VALUES
('Compliance Guidelines 2025.pdf', 'pdf', '1.8 MB', 'Admin Team', 'Updated compliance requirements for oil trading', 'compliance', 1),
('Legal Framework Changes.docx', 'docx', '945 KB', 'Legal Department', 'Recent changes in maritime law', 'legal', 1),
('Technical Standards Update.pdf', 'pdf', '2.2 MB', 'Technical Team', 'New quality standards for oil products', 'technical', 1),
('Contract Template v3.2.docx', 'docx', '756 KB', 'Contract Team', 'Latest contract template with new clauses', 'contract', 1);

-- Verification queries to check if tables were created successfully
-- You can run these to verify everything is working:
-- SELECT COUNT(*) FROM broker_deals;
-- SELECT COUNT(*) FROM broker_documents;
-- SELECT COUNT(*) FROM admin_broker_files;
-- SELECT COUNT(*) FROM broker_payments;
-- SELECT COUNT(*) FROM brokers WHERE membership_status IS NOT NULL;