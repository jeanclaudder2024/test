-- Create missing database tables for oil types and vessel documents

-- Oil Types Table
CREATE TABLE IF NOT EXISTS oil_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL, -- crude, refined, lng, lpg, petrochemical
    api_gravity DECIMAL(5,2),
    sulfur_content DECIMAL(5,3),
    viscosity DECIMAL(8,2),
    density DECIMAL(8,4),
    flash_point INTEGER, -- temperature in celsius
    pour_point INTEGER, -- temperature in celsius
    market_price DECIMAL(10,2), -- USD per barrel/ton
    price_unit TEXT DEFAULT 'barrel', -- barrel, ton, gallon
    description TEXT,
    common_uses TEXT, -- JSON array of uses
    major_producers TEXT, -- JSON array of countries/companies
    trading_symbol TEXT, -- WTI, Brent, etc.
    hs_code TEXT, -- Harmonized System code for customs
    un_class TEXT, -- UN classification for hazardous materials
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Vessel Documents Table
CREATE TABLE IF NOT EXISTS vessel_documents (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER REFERENCES vessels(id),
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    version TEXT DEFAULT '1.0',
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'archived'
    is_required BOOLEAN DEFAULT false,
    expiry_date TIMESTAMP,
    created_by TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP,
    tags TEXT,
    metadata TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert sample oil types
INSERT INTO oil_types (name, display_name, category, api_gravity, sulfur_content, market_price, description, trading_symbol) VALUES
('brent_crude', 'Brent Crude Oil', 'crude', 38.06, 0.37, 85.50, 'Light sweet crude oil from North Sea', 'BRENT'),
('wti_crude', 'West Texas Intermediate', 'crude', 39.6, 0.24, 82.75, 'Light sweet crude oil benchmark', 'WTI'),
('dubai_crude', 'Dubai Crude Oil', 'crude', 31.0, 2.0, 80.25, 'Medium sour crude oil from Middle East', 'DUBAI'),
('gasoline', 'Gasoline', 'refined', 60.0, 0.001, 95.30, 'Motor gasoline for automotive use', 'RBOB'),
('diesel', 'Diesel Fuel', 'refined', 35.0, 0.005, 90.15, 'Diesel fuel for transportation and heating', 'ULSD'),
('jet_fuel', 'Jet Fuel', 'refined', 43.0, 0.003, 88.90, 'Aviation turbine fuel', 'JET'),
('fuel_oil', 'Heavy Fuel Oil', 'refined', 15.0, 3.5, 65.40, 'Heavy fuel oil for marine and power generation', 'HFO'),
('lng', 'Liquefied Natural Gas', 'lng', NULL, NULL, 12.50, 'Natural gas in liquid form for transport', 'LNG'),
('lpg', 'Liquefied Petroleum Gas', 'lpg', NULL, NULL, 85.75, 'Propane and butane mixture', 'LPG'),
('naphtha', 'Naphtha', 'petrochemical', 65.0, 0.001, 87.20, 'Light hydrocarbon mixture for petrochemicals', 'NAPHTHA')
ON CONFLICT (name) DO NOTHING;

-- Insert sample vessel document types
INSERT INTO vessel_documents (vessel_id, document_type, title, description, status, is_required) VALUES
(1, 'Certificate of Registry', 'Vessel Registration Certificate', 'Official registration document for vessel', 'active', true),
(1, 'Safety Certificate', 'Safety Equipment Certificate', 'Certificate for safety equipment compliance', 'active', true),
(1, 'Insurance Certificate', 'Marine Insurance Policy', 'Comprehensive marine insurance coverage', 'active', true),
(2, 'Bill of Lading', 'Cargo Bill of Lading', 'Document for cargo shipment details', 'active', false),
(2, 'Manifest', 'Cargo Manifest', 'Complete list of cargo on board', 'active', false),
(3, 'Charter Party', 'Vessel Charter Agreement', 'Commercial charter agreement document', 'active', false)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oil_types_category ON oil_types(category);
CREATE INDEX IF NOT EXISTS idx_oil_types_active ON oil_types(is_active);
CREATE INDEX IF NOT EXISTS idx_vessel_documents_vessel_id ON vessel_documents(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_documents_type ON vessel_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vessel_documents_status ON vessel_documents(status);