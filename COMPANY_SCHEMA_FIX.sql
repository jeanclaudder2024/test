-- Fix Company Management Database Schema
-- Add missing columns to companies table

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
ADD COLUMN IF NOT EXISTS headquarters TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Create deals table if it doesn't exist
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL,
    fake_company_id INTEGER NOT NULL REFERENCES companies(id),
    real_company_id INTEGER REFERENCES companies(id),
    deal_type TEXT NOT NULL CHECK (deal_type IN ('negotiation', 'contract', 'information_request')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    title TEXT NOT NULL,
    description TEXT,
    requested_volume DECIMAL(15,2),
    requested_price DECIMAL(15,2),
    deal_value DECIMAL(15,2),
    notes TEXT,
    admin_notes TEXT,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Create broker notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS broker_notifications (
    id SERIAL PRIMARY KEY,
    broker_id INTEGER NOT NULL,
    deal_id INTEGER REFERENCES deals(id),
    document_id INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create deal documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS deal_documents (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    file_path TEXT NOT NULL,
    document_type TEXT,
    uploaded_by INTEGER,
    sent_to_broker BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    downloaded_by INTEGER,
    downloaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample real companies
INSERT INTO companies (name, country, region, website, description, company_type, is_visible_to_brokers, publicly_traded, stock_symbol, revenue, employees, founded_year, ceo, fleet_size, specialization, headquarters) VALUES
('ExxonMobil Corporation', 'United States', 'North America', 'https://www.exxonmobil.com', 'American multinational oil and gas corporation', 'real', true, true, 'XOM', 413680000000, 62000, 1999, 'Darren Woods', 45, 'Integrated Oil & Gas', 'Irving, Texas'),
('Shell plc', 'Netherlands', 'Europe', 'https://www.shell.com', 'British-Dutch multinational oil and gas company', 'real', true, true, 'SHEL', 386201000000, 82000, 1907, 'Wael Sawan', 38, 'Integrated Oil & Gas', 'London, UK'),
('Saudi Aramco', 'Saudi Arabia', 'Middle East', 'https://www.aramco.com', 'Saudi Arabian national petroleum and natural gas company', 'real', true, true, '2222.SR', 535200000000, 70000, 1933, 'Amin H. Nasser', 280, 'Crude Oil Production', 'Dhahran, Saudi Arabia'),
('Chevron Corporation', 'United States', 'North America', 'https://www.chevron.com', 'American multinational energy corporation', 'real', true, true, 'CVX', 162465000000, 45600, 1879, 'Mike Wirth', 33, 'Integrated Oil & Gas', 'San Ramon, California'),
('TotalEnergies SE', 'France', 'Europe', 'https://www.totalenergies.com', 'French multinational integrated oil and gas company', 'real', true, true, 'TTE', 200318000000, 105000, 1924, 'Patrick Pouyanné', 35, 'Integrated Oil & Gas', 'Courbevoie, France'),
('BP plc', 'United Kingdom', 'Europe', 'https://www.bp.com', 'British multinational oil and gas company', 'real', true, true, 'BP', 164195000000, 70100, 1909, 'Bernard Looney', 42, 'Integrated Oil & Gas', 'London, UK'),
('Petrobras', 'Brazil', 'South America', 'https://www.petrobras.com.br', 'Brazilian multinational petroleum corporation', 'real', true, true, 'PBR', 124477000000, 45532, 1953, 'Jean Paul Prates', 48, 'Integrated Oil & Gas', 'Rio de Janeiro, Brazil'),
('Eni S.p.A.', 'Italy', 'Europe', 'https://www.eni.com', 'Italian multinational oil and gas company', 'real', true, true, 'ENI', 93816000000, 31400, 1953, 'Claudio Descalzi', 28, 'Integrated Oil & Gas', 'Rome, Italy')
ON CONFLICT (name) DO NOTHING;

-- Insert fake companies linked to real ones
INSERT INTO companies (name, country, region, website, description, company_type, linked_company_id, is_visible_to_brokers, publicly_traded, employees, founded_year, ceo, fleet_size, specialization, headquarters) VALUES
('Global Energy Solutions Ltd', 'United Kingdom', 'Europe', 'https://www.globalenergysolutions.com', 'International energy trading and logistics company', 'fake', 1, true, false, 150, 2015, 'James Morrison', 8, 'Energy Trading', 'London, UK'),
('Atlantic Oil Partners', 'United States', 'North America', 'https://www.atlanticoilpartners.com', 'Premium oil trading and distribution services', 'fake', 2, true, false, 85, 2018, 'Sarah Johnson', 5, 'Oil Trading', 'Houston, Texas'),
('Middle East Energy Corp', 'UAE', 'Middle East', 'https://www.meeenergy.com', 'Regional energy solutions and crude oil trading', 'fake', 3, true, false, 200, 2012, 'Ahmed Al-Rashid', 12, 'Crude Oil Trading', 'Dubai, UAE'),
('Pacific Energy Holdings', 'Singapore', 'Asia-Pacific', 'https://www.pacificenergyholdings.com', 'Asian market energy trading specialist', 'fake', 4, true, false, 120, 2020, 'Li Wei Chen', 7, 'Regional Trading', 'Singapore'),
('European Oil Consortium', 'Switzerland', 'Europe', 'https://www.europeanoilconsortium.com', 'European market oil and gas trading platform', 'fake', 5, true, false, 95, 2017, 'Hans Mueller', 6, 'Market Trading', 'Zurich, Switzerland'),
('Nordic Energy Alliance', 'Norway', 'Europe', 'https://www.nordicenergyalliance.com', 'Scandinavian energy trading and consulting', 'fake', 6, true, false, 75, 2019, 'Erik Andersen', 4, 'Energy Consulting', 'Oslo, Norway'),
('Latin American Oil Trading', 'Panama', 'Latin America', 'https://www.laot.com', 'Regional oil trading and logistics solutions', 'fake', 7, true, false, 110, 2016, 'Carlos Mendez', 6, 'Regional Trading', 'Panama City, Panama'),
('Mediterranean Energy Partners', 'Italy', 'Europe', 'https://www.medenergypartners.com', 'Mediterranean market energy solutions', 'fake', 8, true, false, 90, 2020, 'Marco Rossi', 5, 'Energy Solutions', 'Milan, Italy')
ON CONFLICT (name) DO NOTHING;

-- Insert sample deals
INSERT INTO deals (broker_id, fake_company_id, real_company_id, deal_type, status, title, description, requested_volume, requested_price, deal_value, notes) VALUES
(1, 9, 1, 'negotiation', 'pending', 'Crude Oil Supply Agreement', 'Long-term crude oil supply contract for European markets', 50000, 85.50, 4275000, 'Urgent request for Q1 2025 delivery'),
(1, 10, 2, 'contract', 'approved', 'Refined Products Distribution', 'Distribution agreement for refined petroleum products', 25000, 92.00, 2300000, 'Approved for immediate processing'),
(1, 11, 3, 'information_request', 'pending', 'Market Analysis Request', 'Comprehensive market analysis for Middle East crude pricing', NULL, NULL, NULL, 'Requires detailed regional pricing data'),
(1, 12, 4, 'negotiation', 'rejected', 'LNG Supply Contract', 'Liquefied natural gas supply agreement', 15000, 12.50, 187500, 'Rejected due to pricing concerns'),
(1, 13, 5, 'contract', 'completed', 'Petrochemical Feedstock', 'Petrochemical feedstock supply agreement', 30000, 78.25, 2347500, 'Successfully completed transaction')
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO broker_notifications (broker_id, deal_id, type, title, message) VALUES
(1, 2, 'deal_approved', 'Deal Approved', 'Your deal "Refined Products Distribution" has been approved and is ready for processing.'),
(1, 4, 'deal_rejected', 'Deal Rejected', 'Your deal "LNG Supply Contract" has been rejected due to pricing concerns.'),
(1, 5, 'deal_approved', 'Deal Completed', 'Your deal "Petrochemical Feedstock" has been successfully completed.')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_companies_linked ON companies(linked_company_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_broker ON deals(broker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_broker ON broker_notifications(broker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON broker_notifications(is_read);