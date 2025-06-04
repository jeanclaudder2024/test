-- Simplified Company Management System for Supabase
-- This creates essential tables for Real/Fake companies with deal tracking

-- Update existing companies table with new columns for company types
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT 'real' CHECK (company_type IN ('real', 'fake')),
ADD COLUMN IF NOT EXISTS linked_company_id INTEGER,
ADD COLUMN IF NOT EXISTS is_visible_to_brokers BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS publicly_traded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_symbol TEXT,
ADD COLUMN IF NOT EXISTS revenue DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS employees INTEGER,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS ceo TEXT,
ADD COLUMN IF NOT EXISTS fleet_size INTEGER,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Create deals table for tracking broker requests (simplified without foreign keys initially)
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL,
    fake_company_id INTEGER NOT NULL,
    deal_type TEXT NOT NULL CHECK (deal_type IN ('negotiation', 'contract', 'information_request')),
    title TEXT NOT NULL,
    description TEXT,
    requested_volume DECIMAL(15,2),
    requested_price DECIMAL(10,2),
    deal_value DECIMAL(15,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Create deal documents table for storing generated documents
CREATE TABLE IF NOT EXISTS deal_documents (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT
);

-- Create broker notifications table
CREATE TABLE IF NOT EXISTS broker_notifications (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL,
    deal_id INTEGER,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('deal_approved', 'deal_rejected', 'document_ready', 'general')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create broker companies junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS broker_companies (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    relationship_type TEXT DEFAULT 'authorized' CHECK (relationship_type IN ('authorized', 'restricted', 'preferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(broker_id, company_id)
);

-- Create company partnerships table
CREATE TABLE IF NOT EXISTS company_partnerships (
    id SERIAL PRIMARY KEY,
    real_company_id INTEGER NOT NULL,
    fake_company_id INTEGER NOT NULL,
    partnership_type TEXT DEFAULT 'subsidiary' CHECK (partnership_type IN ('subsidiary', 'joint_venture', 'strategic_alliance')),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(real_company_id, fake_company_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_company_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_companies_linked_company ON companies(linked_company_id);
CREATE INDEX IF NOT EXISTS idx_deals_broker_id ON deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_deals_fake_company_id ON deals(fake_company_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_broker_notifications_broker_id ON broker_notifications(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_notifications_is_read ON broker_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_broker_companies_broker_id ON broker_companies(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_companies_company_id ON broker_companies(company_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at 
    BEFORE UPDATE ON deals 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data for testing
INSERT INTO companies (name, country, region, headquarters, company_type, specialization, fleet_size, employees, publicly_traded) VALUES
('ExxonMobil Corporation', 'United States', 'North America', 'Irving, Texas', 'real', 'Crude Oil', 45, 72000, true),
('Shell plc', 'Netherlands', 'Europe', 'The Hague', 'real', 'Mixed Fleet', 38, 82000, true),
('BP plc', 'United Kingdom', 'Europe', 'London', 'real', 'Mixed Fleet', 42, 70100, true),
('TotalEnergies SE', 'France', 'Europe', 'Courbevoie', 'real', 'Mixed Fleet', 35, 105000, true),
('Chevron Corporation', 'United States', 'North America', 'San Ramon, California', 'real', 'Crude Oil', 33, 45600, true)
ON CONFLICT (name) DO NOTHING;

-- Insert fake companies linked to real ones
INSERT INTO companies (name, country, region, headquarters, company_type, linked_company_id, specialization, fleet_size, employees, is_visible_to_brokers) 
SELECT 
    'Global Energy Solutions Ltd', 'Singapore', 'Asia-Pacific', 'Singapore', 'fake', id, 'Crude Oil', 15, 2500, true
FROM companies WHERE name = 'ExxonMobil Corporation' AND company_type = 'real'
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, country, region, headquarters, company_type, linked_company_id, specialization, fleet_size, employees, is_visible_to_brokers)
SELECT 
    'Atlantic Maritime Corp', 'Liberia', 'Africa', 'Monrovia', 'fake', id, 'Mixed Fleet', 12, 1800, true
FROM companies WHERE name = 'Shell plc' AND company_type = 'real'
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, country, region, headquarters, company_type, linked_company_id, specialization, fleet_size, employees, is_visible_to_brokers)
SELECT 
    'Pacific Oil Transport', 'Panama', 'Latin America', 'Panama City', 'fake', id, 'Refined Products', 8, 1200, true
FROM companies WHERE name = 'BP plc' AND company_type = 'real'
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;