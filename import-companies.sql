-- Import companies table from Excel data manually

-- First, create the companies table if it doesn't exist (should already be created by Drizzle)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  region TEXT,
  headquarters TEXT,
  founded_year INTEGER,
  ceo TEXT,
  fleet_size INTEGER,
  specialization TEXT,
  website TEXT,
  logo TEXT,
  description TEXT,
  revenue DECIMAL(15, 2),
  employees INTEGER,
  publicly_traded BOOLEAN DEFAULT FALSE,
  stock_symbol TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Clear existing data
DELETE FROM companies;

-- Now insert the companies from the Excel file manually
-- Maersk
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description, revenue)
VALUES ('Maersk', 'Denmark', 'Europe', 'Copenhagen', 1904, 'Vincent Clerc', 700, 'Container Shipping, Oil Transport', 'https://www.maersk.com', 
'A.P. Moller-Maersk is an integrated container logistics company and member of the A.P. Moller Group. Connecting and simplifying trade to help our customers grow and thrive.', 61800);

-- Mediterranean Shipping Company (MSC)
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Mediterranean Shipping Company', 'Switzerland', 'Europe', 'Geneva', 1970, 'Soren Toft', 675, 'Container Shipping, Oil Products', 'https://www.msc.com',
'Mediterranean Shipping Company (MSC) is a global leader in transportation and logistics, with a network of offices in 155 countries, with access to an integrated network of road, rail and sea transport resources.');

-- COSCO Shipping
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('COSCO Shipping', 'China', 'Asia-Pacific', 'Shanghai', 1961, 'Huang Xiaowen', 1330, 'Bulk Carriers, Oil Tankers', 'https://www.coscoshipping.com',
'China COSCO Shipping Corporation Limited (COSCO SHIPPING) is a Chinese state-owned shipping and logistics services supplier.');

-- CMA CGM Group
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description, revenue)
VALUES ('CMA CGM Group', 'France', 'Europe', 'Marseille', 1978, 'Rodolphe Saadé', 580, 'Container Shipping, LNG Carriers', 'https://www.cmacgm-group.com',
'CMA CGM Group is a leading worldwide shipping and logistics group, offering turnkey solutions combining transport by sea, land and air.', 56000);

-- Hapag-Lloyd
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Hapag-Lloyd', 'Germany', 'Europe', 'Hamburg', 1847, 'Rolf Habben Jansen', 250, 'Container Shipping, Oil Transport', 'https://www.hapag-lloyd.com',
'Hapag-Lloyd is a leading global liner shipping company with 250 vessels and a total transport capacity of 1.8 Million TEU.');

-- ONE (Ocean Network Express)
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Ocean Network Express', 'Japan', 'Asia-Pacific', 'Tokyo', 2017, 'Jeremy Nixon', 220, 'Container Shipping, Oil Products', 'https://www.one-line.com',
'Ocean Network Express (ONE) is a joint venture of three Japanese shipping companies: Kawasaki Kisen Kaisha, Mitsui O.S.K. Lines, and Nippon Yusen Kabushiki Kaisha.');

-- Evergreen Marine
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Evergreen Marine', 'Taiwan', 'Asia-Pacific', 'Taipei', 1968, 'Chang Yen-I', 200, 'Container Shipping, Crude Oil', 'https://www.evergreen-line.com',
'Evergreen Marine Corporation is a Taiwan-based shipping company that mainly operates container ships. It is part of the Evergreen Group conglomerate.');

-- Yang Ming Marine Transport
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Yang Ming Marine Transport', 'Taiwan', 'Asia-Pacific', 'Keelung', 1972, 'Cheng Cheng-Mount', 100, 'Container Shipping, Oil Tankers', 'https://www.yangming.com',
'Yang Ming Marine Transport Corporation is a Taiwanese shipping company with a fleet of container ships and bulk carriers.');

-- HMM (Hyundai Merchant Marine)
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Hyundai Merchant Marine', 'South Korea', 'Asia-Pacific', 'Seoul', 1976, 'Kim Kyung Bae', 110, 'Container Shipping, Crude Oil', 'https://www.hmm21.com',
'HMM is a South Korean container transportation and shipping company. It is currently the eighth largest container shipping line in the world.');

-- PIL (Pacific International Lines)
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Pacific International Lines', 'Singapore', 'Asia-Pacific', 'Singapore', 1967, 'Teo Siong Seng', 150, 'Container Shipping, Oil Products', 'https://www.pilship.com',
'Pacific International Lines (PIL) is a Singaporean shipping company focused primarily on the Asia-Pacific markets.');

-- Bahri (National Shipping Company of Saudi Arabia)
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Bahri', 'Saudi Arabia', 'Middle East', 'Riyadh', 1978, 'Abdullah Aldubaikhi', 90, 'Crude Oil, LNG, Chemical Carriers', 'https://www.bahri.sa',
'Bahri (National Shipping Company of Saudi Arabia) is a global leader in logistics and transportation, specializing in oil tankers, chemical carriers, and general cargo.');

-- Euronav
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Euronav', 'Belgium', 'Europe', 'Antwerp', 1995, 'Alexander Saverys', 75, 'Crude Oil Transport', 'https://www.euronav.com',
'Euronav is one of the largest independent tanker companies in the world engaged in the ocean transportation and storage of crude oil.');

-- Frontline
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Frontline', 'Bermuda', 'North America', 'Hamilton', 1985, 'Lars H. Barstad', 70, 'Crude Oil, Oil Products', 'https://www.frontline.bm',
'Frontline is a shipping company engaged primarily in the ownership and operation of oil tankers. It's one of the world's largest oil tanker shipping companies.');

-- Teekay Corporation
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Teekay Corporation', 'Bermuda', 'North America', 'Hamilton', 1973, 'Kenneth Hvid', 120, 'LNG Carriers, Oil Tankers', 'https://www.teekay.com',
'Teekay Corporation is one of the world''s largest operators of mid-sized tankers, providing crude oil and product transportation services.');

-- TORM
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('TORM', 'Denmark', 'Europe', 'Copenhagen', 1889, 'Jacob Meldgaard', 85, 'Product Tankers, Refined Oil Products', 'https://www.torm.com',
'TORM is a pure play product tanker company and one of the world''s leading carriers of refined oil products.');

-- Scorpio Tankers
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Scorpio Tankers', 'Monaco', 'Europe', 'Monaco', 2009, 'Emanuele Lauro', 130, 'Product Tankers, Chemical Products', 'https://www.scorpiotankers.com',
'Scorpio Tankers Inc. is a provider of marine transportation of petroleum products worldwide. It owns, leases, and operates product tankers.');

-- Ardmore Shipping
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Ardmore Shipping', 'Ireland', 'Europe', 'Cork', 2010, 'Anthony Gurnee', 30, 'Product and Chemical Tankers', 'https://www.ardmoreshipping.com',
'Ardmore Shipping Corporation owns and operates a fleet of mid-size product and chemical tankers involved in shipping petroleum products and chemicals worldwide.');

-- DHT Holdings
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('DHT Holdings', 'Bermuda', 'North America', 'Hamilton', 2005, 'Svein Moxnes Harfjeld', 25, 'Crude Oil Transport', 'https://www.dhtankers.com',
'DHT Holdings, Inc. operates a fleet of crude oil tankers. The company operates through its integrated management companies in Monaco, Norway, and Singapore.');

-- Sovcomflot (SCF Group)
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Sovcomflot', 'Russia', 'Europe', 'Moscow', 1988, 'Igor Tonkovidov', 145, 'Crude Oil, LNG, Offshore Services', 'https://www.scf-group.com',
'Sovcomflot (SCF Group) is Russia''s largest shipping company and one of the world''s leading energy shipping companies, specializing in the transportation of crude oil, petroleum products, and liquefied gas.');

-- Stena Bulk
INSERT INTO companies (name, country, region, headquarters, founded_year, ceo, fleet_size, specialization, website, description)
VALUES ('Stena Bulk', 'Sweden', 'Europe', 'Gothenburg', 1982, 'Erik Hånell', 110, 'Crude Oil, Products, Chemicals', 'https://www.stenabulk.com',
'Stena Bulk is one of the world''s leading tanker shipping companies with a global fleet of nearly 100 vessels. The company has offices in six countries.');

-- Select all companies to verify the import
-- SELECT * FROM companies;