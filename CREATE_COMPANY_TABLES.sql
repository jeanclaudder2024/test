-- Create Real Companies and Fake Companies tables for the Company Management System
-- Run this script in your Supabase SQL editor

-- Real Companies table - stores professional company data entered by admin
CREATE TABLE IF NOT EXISTS real_companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'Oil',
    address TEXT NOT NULL,
    logo TEXT,
    description TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    email TEXT,
    founded INTEGER,
    employees INTEGER,
    revenue TEXT,
    headquarters TEXT,
    ceo TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fake Companies table - stores auto-generated companies linked to real companies
CREATE TABLE IF NOT EXISTS fake_companies (
    id SERIAL PRIMARY KEY,
    real_company_id INTEGER NOT NULL REFERENCES real_companies(id) ON DELETE CASCADE,
    generated_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fake_companies_real_company_id ON fake_companies(real_company_id);
CREATE INDEX IF NOT EXISTS idx_real_companies_industry ON real_companies(industry);
CREATE INDEX IF NOT EXISTS idx_real_companies_name ON real_companies(name);

-- Insert sample real companies for testing (only if they don't exist)
INSERT INTO real_companies (name, industry, address, description, website, phone, email, founded, employees, revenue, headquarters, ceo) 
SELECT 'Chevron Corporation', 'Oil', '6001 Bollinger Canyon Rd, San Ramon, CA 94583, USA', 'Chevron Corporation is an American multinational energy corporation. One of the successor companies of Standard Oil, it is headquartered in San Ramon, California, and active in more than 180 countries.', 'https://www.chevron.com', '+1-925-842-1000', 'info@chevron.com', 1879, 47600, '$162.5 billion', 'San Ramon, California, USA', 'Mike Wirth'
WHERE NOT EXISTS (SELECT 1 FROM real_companies WHERE name = 'Chevron Corporation');

INSERT INTO real_companies (name, industry, address, description, website, phone, email, founded, employees, revenue, headquarters, ceo) 
SELECT 'ExxonMobil Corporation', 'Oil', '5959 Las Colinas Blvd, Irving, TX 75039, USA', 'Exxon Mobil Corporation is an American multinational oil and gas corporation headquartered in Irving, Texas. It is the largest direct descendant of John D. Rockefellers Standard Oil.', 'https://corporate.exxonmobil.com', '+1-972-444-1000', 'info@exxonmobil.com', 1999, 63000, '$413.7 billion', 'Irving, Texas, USA', 'Darren Woods'
WHERE NOT EXISTS (SELECT 1 FROM real_companies WHERE name = 'ExxonMobil Corporation');

INSERT INTO real_companies (name, industry, address, description, website, phone, email, founded, employees, revenue, headquarters, ceo) 
SELECT 'Shell plc', 'Oil', 'Shell Centre, London SE1 7NA, United Kingdom', 'Shell plc is a British multinational oil and gas company headquartered in London, England. Shell is a public limited company with a primary listing on the London Stock Exchange.', 'https://www.shell.com', '+44-20-7934-4000', 'info@shell.com', 1907, 82000, '$386.2 billion', 'London, United Kingdom', 'Wael Sawan'
WHERE NOT EXISTS (SELECT 1 FROM real_companies WHERE name = 'Shell plc');

INSERT INTO real_companies (name, industry, address, description, website, phone, email, founded, employees, revenue, headquarters, ceo) 
SELECT 'TotalEnergies SE', 'Oil', '2 Place Jean Millier, 92400 Courbevoie, France', 'TotalEnergies SE is a French multinational integrated energy and petroleum company founded in 1924 and one of the seven supermajor oil companies.', 'https://totalenergies.com', '+33-1-47-44-45-46', 'contact@totalenergies.com', 1924, 105000, '$209.5 billion', 'Courbevoie, France', 'Patrick Pouyanné'
WHERE NOT EXISTS (SELECT 1 FROM real_companies WHERE name = 'TotalEnergies SE');

INSERT INTO real_companies (name, industry, address, description, website, phone, email, founded, employees, revenue, headquarters, ceo) 
SELECT 'BP plc', 'Oil', '1 St James Square, London SW1Y 4PD, United Kingdom', 'BP plc is a British multinational oil and gas company headquartered in London, England. It is one of the oil and gas supermajors and one of the worlds largest companies.', 'https://www.bp.com', '+44-20-7496-4000', 'press.office@bp.com', 1909, 66800, '$164.2 billion', 'London, United Kingdom', 'Bernard Looney'
WHERE NOT EXISTS (SELECT 1 FROM real_companies WHERE name = 'BP plc');

-- Insert sample fake companies linked to real companies
INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Global Maritime Energy Corp' 
FROM real_companies r 
WHERE r.name = 'Chevron Corporation' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Global Maritime Energy Corp');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Pacific Oil Trading Solutions' 
FROM real_companies r 
WHERE r.name = 'Chevron Corporation' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Pacific Oil Trading Solutions');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'International Petroleum Holdings' 
FROM real_companies r 
WHERE r.name = 'ExxonMobil Corporation' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'International Petroleum Holdings');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Northern Energy Logistics Ltd' 
FROM real_companies r 
WHERE r.name = 'ExxonMobil Corporation' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Northern Energy Logistics Ltd');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Atlantic Oil Transport Group' 
FROM real_companies r 
WHERE r.name = 'Shell plc' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Atlantic Oil Transport Group');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Maritime Energy Partners' 
FROM real_companies r 
WHERE r.name = 'Shell plc' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Maritime Energy Partners');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Western Oil Trading Systems' 
FROM real_companies r 
WHERE r.name = 'TotalEnergies SE' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Western Oil Trading Systems');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Global Energy Solutions Corp' 
FROM real_companies r 
WHERE r.name = 'TotalEnergies SE' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Global Energy Solutions Corp');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'Eastern Maritime Oil Ltd' 
FROM real_companies r 
WHERE r.name = 'BP plc' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'Eastern Maritime Oil Ltd');

INSERT INTO fake_companies (real_company_id, generated_name) 
SELECT r.id, 'International Trading Enterprises' 
FROM real_companies r 
WHERE r.name = 'BP plc' 
AND NOT EXISTS (SELECT 1 FROM fake_companies f WHERE f.generated_name = 'International Trading Enterprises');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update timestamps
DROP TRIGGER IF EXISTS update_real_companies_updated_at ON real_companies;
CREATE TRIGGER update_real_companies_updated_at BEFORE UPDATE ON real_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fake_companies_updated_at ON fake_companies;
CREATE TRIGGER update_fake_companies_updated_at BEFORE UPDATE ON fake_companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();