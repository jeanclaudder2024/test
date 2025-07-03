-- Vessel Types Management Table
-- Add this to your Supabase database to enable dynamic vessel type management

CREATE TABLE IF NOT EXISTS vessel_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50), -- e.g., 'TANKER', 'CARGO', 'CONTAINER', etc.
  icon VARCHAR(50), -- for UI display
  color VARCHAR(20), -- hex color for map markers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common vessel types
INSERT INTO vessel_types (name, description, category, icon, color) VALUES
('Oil Tanker', 'Vessels designed to transport crude oil and petroleum products', 'TANKER', '🛢️', '#FF6B35'),
('Crude Oil Tanker', 'Large vessels specifically for crude oil transport', 'TANKER', '⚫', '#8B4513'),
('Product Tanker', 'Tankers for refined petroleum products', 'TANKER', '🛢️', '#FF8C00'),
('Chemical Tanker', 'Vessels for transporting liquid chemicals', 'TANKER', '⚗️', '#9932CC'),
('LNG Carrier', 'Liquefied Natural Gas transport vessels', 'GAS', '❄️', '#00CED1'),
('LPG Carrier', 'Liquefied Petroleum Gas transport vessels', 'GAS', '🔥', '#FF69B4'),
('Container Ship', 'Cargo vessels for containerized freight', 'CARGO', '📦', '#4169E1'),
('Bulk Carrier', 'Ships for dry bulk commodities', 'CARGO', '⚓', '#2E8B57'),
('General Cargo', 'Multi-purpose cargo vessels', 'CARGO', '🚢', '#696969'),
('Supply Vessel', 'Support vessels for offshore operations', 'OFFSHORE', '🔧', '#FF4500'),
('Tug Boat', 'Vessels for towing and pushing operations', 'SERVICE', '🚤', '#32CD32'),
('Research Vessel', 'Scientific and research ships', 'SPECIAL', '🔬', '#6A5ACD')
ON CONFLICT (name) DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vessel_types_category ON vessel_types(category);
CREATE INDEX IF NOT EXISTS idx_vessel_types_name ON vessel_types(name);