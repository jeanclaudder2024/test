-- Enhanced Deal Management System Schema
-- Comprehensive oil trading deal information structure

-- Create enhanced deals table
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  deal_code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Oil Type / Commodity Information
  oil_type TEXT NOT NULL, -- ULSD EN 590, Gasoline, Crude Oil, etc.
  commodity_spec TEXT, -- 10ppm, Standard Gasoline Spec, etc.
  quality_grade TEXT, -- ULSD 10ppm, Standard Gasoline Spec
  
  -- Geographic Information
  origin_country TEXT NOT NULL, -- Non-Sanctioned, Kharg Island, etc.
  destination_ports TEXT[], -- Array of destination ports
  loading_port TEXT NOT NULL,
  discharge_ports TEXT[],
  
  -- Quantity & Pricing
  quantity_barrels DECIMAL(15,2),
  quantity_mts DECIMAL(15,2), -- Metric tons
  deal_value_usd DECIMAL(15,2),
  price_per_barrel DECIMAL(10,4),
  market_price DECIMAL(10,4), -- For transparent comparison
  
  -- Contract Information
  contract_type TEXT NOT NULL, -- Spot Trial, 12 Months Optional, etc.
  delivery_terms TEXT NOT NULL, -- FOB, CIF, etc.
  payment_terms TEXT, -- MT103/TT After Successful Delivery
  
  -- Companies & Sources
  source_company TEXT NOT NULL, -- BP, Source Refinery, etc.
  target_refinery TEXT,
  buyer_company TEXT,
  seller_company TEXT,
  
  -- Deal Status & Verification
  deal_status TEXT DEFAULT 'open', -- open, reserved, closed, cancelled
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  
  -- Customer Experience
  customer_rating DECIMAL(3,2), -- 4.7/5
  total_reviews INTEGER DEFAULT 0,
  
  -- Dates
  deal_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Associated Vessel
  vessel_id INTEGER REFERENCES vessels(id),
  
  -- Additional Metadata
  is_active BOOLEAN DEFAULT true,
  deal_priority TEXT DEFAULT 'standard', -- high, standard, low
  currency_code VARCHAR(3) DEFAULT 'USD'
);

-- Create enhanced vessel cargo tracking
ALTER TABLE vessels 
ADD COLUMN IF NOT EXISTS current_deal_id INTEGER REFERENCES deals(id),
ADD COLUMN IF NOT EXISTS cargo_status TEXT DEFAULT 'loaded', -- loaded, discharged, in_transit
ADD COLUMN IF NOT EXISTS cargo_manifest_url TEXT,
ADD COLUMN IF NOT EXISTS bill_of_lading TEXT,
ADD COLUMN IF NOT EXISTS customs_status TEXT,
ADD COLUMN IF NOT EXISTS inspection_status TEXT;

-- Enhanced deal tracking and analytics
CREATE TABLE IF NOT EXISTS deal_analytics (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(15,4),
  metric_unit TEXT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Deal subscription tracking
CREATE TABLE IF NOT EXISTS deal_subscriptions (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id),
  user_id INTEGER REFERENCES users(id),
  subscription_type TEXT NOT NULL, -- view, reserve, purchase
  subscription_date TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(deal_status);
CREATE INDEX IF NOT EXISTS idx_deals_date ON deals(deal_date);
CREATE INDEX IF NOT EXISTS idx_deals_vessel ON deals(vessel_id);
CREATE INDEX IF NOT EXISTS idx_deals_code ON deals(deal_code);
CREATE INDEX IF NOT EXISTS idx_vessel_cargo_status ON vessels(cargo_status);

-- Insert sample comprehensive deal data
INSERT INTO deals (
  deal_code, oil_type, commodity_spec, quality_grade,
  origin_country, destination_ports, loading_port,
  quantity_barrels, quantity_mts, deal_value_usd,
  price_per_barrel, market_price,
  contract_type, delivery_terms, payment_terms,
  source_company, target_refinery,
  deal_status, is_verified, customer_rating, total_reviews,
  deal_date, is_active
) VALUES 
(
  'DEAL-00923', 'ULSD EN 590 – 10ppm', '10ppm Specification', 'ULSD 10ppm',
  'Non-Sanctioned / Kharg Island', 
  ARRAY['Rotterdam', 'Houston', 'Jurong', 'Fujairah', 'ASWP'],
  'Kharg Island',
  1291833, 205893.28, 93806381,
  72.61, 72.37,
  'Spot Trial + 12 Months Optional Contract', 'FOB – CIF',
  'MT103/TT After Successful Delivery',
  'BP / Source Refinery', 'Esmeraldas Refinery',
  'open', true, 4.7, 13,
  '2025-07-01', true
),
(
  'ULSD-RTM-JULY25', 'Gasoline', 'Standard Gasoline Spec', 'Standard Gasoline',
  'Kuwait / Middle East', 
  ARRAY['Rotterdam', 'Houston', 'Singapore'],
  'Kuwait Oil Pier',
  850000, 135600, 61675000,
  72.50, 72.20,
  'Spot Contract', 'CIF',
  'L/C at Sight',
  'Kuwait Petroleum', 'Rotterdam Refinery',
  'reserved', true, 4.5, 8,
  '2025-07-01', true
);

-- Update existing vessels with deal associations (sample data)
UPDATE vessels 
SET current_deal_id = (SELECT id FROM deals WHERE deal_code = 'DEAL-00923' LIMIT 1),
    cargo_status = 'loaded',
    inspection_status = 'passed'
WHERE name ILIKE '%tanker%' OR cargo_type ILIKE '%oil%' 
LIMIT 5;

COMMENT ON TABLE deals IS 'Comprehensive oil trading deals with full commercial information';
COMMENT ON TABLE deal_analytics IS 'Deal performance metrics and analytics tracking';
COMMENT ON TABLE deal_subscriptions IS 'User subscriptions and reservations for deals';