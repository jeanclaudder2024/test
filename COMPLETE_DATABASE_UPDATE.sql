-- COMPLETE DATABASE UPDATE FOR BROKER PAYMENT SYSTEM
-- Copy this entire file and paste it into your Supabase SQL Editor
-- Then click "Run" to execute all commands

-- =============================================
-- 1. CREATE BROKER PAYMENT TABLES
-- =============================================

-- Create broker deals table
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

-- Create broker documents table
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

-- Create admin broker files table
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

-- Create broker payments table for membership tracking
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

-- =============================================
-- 2. UPDATE EXISTING BROKERS TABLE
-- =============================================

-- Add membership and profile columns to brokers table
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

-- =============================================
-- 3. INSERT SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample broker deals
INSERT INTO broker_deals (deal_title, company_name, company_id, deal_value, status, progress, oil_type, quantity, notes, broker_id) VALUES
('Crude Oil Supply Agreement', 'ExxonMobil Corporation', 1, '$2.5M', 'active', 75, 'Brent Crude', '50,000 barrels', 'Q1 2025 delivery', 1),
('Refined Products Deal', 'Shell Trading', 2, '$1.8M', 'pending', 25, 'Gasoline', '30,000 barrels', 'Pending approval', 1),
('Natural Gas Contract', 'BP Energy', 3, '$3.2M', 'active', 90, 'Natural Gas', '100,000 MMBtu', 'Near completion', 1),
('Heating Oil Distribution', 'Total Energies', 4, '$950K', 'completed', 100, 'Heating Oil', '15,000 barrels', 'Successfully delivered', 1),
('Diesel Fuel Agreement', 'Chevron Corporation', 5, '$1.2M', 'cancelled', 10, 'Diesel', '25,000 barrels', 'Contract cancelled', 1),
('LNG Export Deal', 'Qatar Petroleum', 6, '$4.2M', 'active', 60, 'Liquefied Natural Gas', '75,000 tons', 'Major LNG export contract', 1),
('Jet Fuel Supply', 'Aviation Fuel Corp', 7, '$1.5M', 'pending', 15, 'Jet Fuel', '20,000 barrels', 'Airport fuel supply contract', 1),
('Marine Bunker Fuel', 'Maersk Line', 8, '$800K', 'active', 45, 'Bunker Fuel', '12,000 tons', 'Shipping fuel supply', 1);

-- Insert sample broker documents
INSERT INTO broker_documents (name, type, size, uploaded_by, deal_id, is_admin_file, broker_id) VALUES
('Supply Agreement.pdf', 'contract', '2.4 MB', 'John Broker', 1, false, 1),
('Quality Certificate.pdf', 'certificate', '1.2 MB', 'Admin', 1, true, 1),
('Shipping Documentation.docx', 'shipping', '856 KB', 'John Broker', 2, false, 1),
('Insurance Policy.pdf', 'insurance', '3.1 MB', 'Admin', 3, true, 1),
('Delivery Receipt.pdf', 'receipt', '524 KB', 'John Broker', 4, false, 1),
('Bill of Lading.pdf', 'shipping', '1.8 MB', 'John Broker', 6, false, 1),
('Payment Confirmation.pdf', 'financial', '945 KB', 'Admin', 6, true, 1),
('Fuel Specifications.docx', 'technical', '1.5 MB', 'John Broker', 7, false, 1),
('Safety Certificate.pdf', 'compliance', '2.1 MB', 'Admin', 8, true, 1),
('Port Clearance.pdf', 'regulatory', '678 KB', 'John Broker', 8, false, 1);

-- Insert sample admin broker files
INSERT INTO admin_broker_files (file_name, file_type, file_size, sent_by, description, category, broker_id) VALUES
('Compliance Guidelines 2025.pdf', 'pdf', '1.8 MB', 'Admin Team', 'Updated compliance requirements for oil trading', 'compliance', 1),
('Legal Framework Changes.docx', 'docx', '945 KB', 'Legal Department', 'Recent changes in maritime law', 'legal', 1),
('Technical Standards Update.pdf', 'pdf', '2.2 MB', 'Technical Team', 'New quality standards for oil products', 'technical', 1),
('Contract Template v3.2.docx', 'docx', '756 KB', 'Contract Team', 'Latest contract template with new clauses', 'contract', 1),
('Market Analysis Q1 2025.pdf', 'pdf', '3.4 MB', 'Market Research', 'Quarterly market analysis and pricing trends', 'technical', 1),
('Safety Protocols Update.pdf', 'pdf', '1.9 MB', 'Safety Department', 'Updated safety protocols for oil handling', 'compliance', 1),
('Payment Terms Guide.docx', 'docx', '1.1 MB', 'Finance Team', 'Guide to payment terms and procedures', 'contract', 1),
('Regulatory Changes Notice.pdf', 'pdf', '2.5 MB', 'Compliance Officer', 'Important regulatory changes affecting brokers', 'legal', 1);

-- Insert sample payment record for testing
INSERT INTO broker_payments (broker_id, amount, currency, status, membership_start_date, membership_end_date, membership_card_generated) VALUES
(1, 299.00, 'USD', 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', true);

-- =============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_broker_deals_broker_id ON broker_deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_deals_status ON broker_deals(status);
CREATE INDEX IF NOT EXISTS idx_broker_documents_broker_id ON broker_documents(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_documents_deal_id ON broker_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_admin_broker_files_broker_id ON admin_broker_files(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_payments_broker_id ON broker_payments(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_payments_status ON broker_payments(status);
CREATE INDEX IF NOT EXISTS idx_brokers_membership_status ON brokers(membership_status);

-- =============================================
-- 5. VERIFICATION QUERIES
-- =============================================

-- These queries will show you the results after setup
-- You can run them separately to verify everything worked

-- Check table creation and data
SELECT 'broker_deals' as table_name, COUNT(*) as record_count FROM broker_deals
UNION ALL
SELECT 'broker_documents' as table_name, COUNT(*) as record_count FROM broker_documents
UNION ALL
SELECT 'admin_broker_files' as table_name, COUNT(*) as record_count FROM admin_broker_files
UNION ALL
SELECT 'broker_payments' as table_name, COUNT(*) as record_count FROM broker_payments;

-- Check brokers table new columns
SELECT 
  id, 
  email, 
  membership_status, 
  first_name, 
  last_name, 
  profile_completed
FROM brokers 
LIMIT 5;

-- =============================================
-- SETUP COMPLETE!
-- =============================================

-- After running this SQL:
-- ✅ All broker payment tables created
-- ✅ Brokers table enhanced with membership fields  
-- ✅ Sample data inserted for testing
-- ✅ Indexes created for performance
-- ✅ Payment system ready to use

-- Your broker upgrade and payment system is now fully functional!
-- Users can complete the 4-step upgrade process and pay $299 for membership.