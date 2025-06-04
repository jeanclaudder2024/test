-- Enhanced Company Management System for Supabase
-- This creates all the tables needed for Real/Fake companies with deal tracking

-- First, update the existing companies table with new columns
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT 'real' CHECK (company_type IN ('real', 'fake')),
ADD COLUMN IF NOT EXISTS linked_company_id INTEGER REFERENCES companies(id),
ADD COLUMN IF NOT EXISTS is_visible_to_brokers BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS publicly_traded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_symbol TEXT,
ADD COLUMN IF NOT EXISTS revenue DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS employees INTEGER,
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS ceo TEXT,
ADD COLUMN IF NOT EXISTS fleet_size INTEGER,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create deals table for tracking broker requests
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES brokers(id),
    fake_company_id INTEGER NOT NULL REFERENCES companies(id),
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
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Create deal documents table for storing generated documents
CREATE TABLE IF NOT EXISTS deal_documents (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- Create broker notifications table
CREATE TABLE IF NOT EXISTS broker_notifications (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL REFERENCES brokers(id),
    deal_id INTEGER REFERENCES deals(id),
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
    broker_id INTEGER NOT NULL REFERENCES brokers(id),
    company_id INTEGER NOT NULL REFERENCES companies(id),
    relationship_type TEXT DEFAULT 'authorized' CHECK (relationship_type IN ('authorized', 'restricted', 'preferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(broker_id, company_id)
);

-- Create company partnerships table
CREATE TABLE IF NOT EXISTS company_partnerships (
    id SERIAL PRIMARY KEY,
    real_company_id INTEGER NOT NULL REFERENCES companies(id),
    fake_company_id INTEGER NOT NULL REFERENCES companies(id),
    partnership_type TEXT DEFAULT 'subsidiary' CHECK (partnership_type IN ('subsidiary', 'joint_venture', 'strategic_alliance')),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(real_company_id, fake_company_id)
);

-- Create user broker connections table
CREATE TABLE IF NOT EXISTS user_broker_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    broker_id INTEGER NOT NULL REFERENCES brokers(id),
    role TEXT DEFAULT 'agent' CHECK (role IN ('agent', 'manager', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, broker_id)
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

-- Add constraint to ensure fake companies are linked to real companies
ALTER TABLE companies 
ADD CONSTRAINT check_fake_company_linked 
CHECK (
    (company_type = 'real') OR 
    (company_type = 'fake' AND linked_company_id IS NOT NULL)
);

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

-- Grant necessary permissions (adjust as needed for your setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE broker_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (optional - uncomment and modify as needed)
-- CREATE POLICY "Brokers can view their own deals" ON deals FOR SELECT USING (broker_id = auth.uid());
-- CREATE POLICY "Brokers can create deals" ON deals FOR INSERT WITH CHECK (broker_id = auth.uid());
-- CREATE POLICY "Brokers can view their notifications" ON broker_notifications FOR SELECT USING (broker_id = auth.uid());

COMMIT;