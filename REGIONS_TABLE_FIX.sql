-- Fix regions table structure to match schema expectations
-- Run this SQL to create the regions table with correct columns

-- Drop existing table if it exists with wrong structure
DROP TABLE IF EXISTS regions CASCADE;

-- Create regions table with all required columns
CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  parent_region TEXT,
  countries TEXT NOT NULL DEFAULT '[]',
  major_ports TEXT,
  major_refineries TEXT,
  time_zones TEXT,
  primary_languages TEXT,
  currencies TEXT,
  trading_hours TEXT,
  description TEXT,
  economic_profile TEXT,
  regulatory_framework TEXT,
  market_characteristics TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Insert some basic regions for testing
INSERT INTO regions (name, code, countries, description, sort_order) VALUES
('Asia Pacific', 'APAC', '["China", "Japan", "South Korea", "Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Australia"]', 'Asia Pacific region covering major oil markets', 1),
('Europe Middle East Africa', 'EMEA', '["United Kingdom", "Germany", "France", "Netherlands", "Norway", "Saudi Arabia", "UAE", "Nigeria", "Angola"]', 'Europe, Middle East and Africa region', 2),
('Americas', 'AMERICAS', '["United States", "Canada", "Mexico", "Brazil", "Venezuela", "Colombia", "Argentina"]', 'North and South America region', 3);

-- Create index for better performance
CREATE INDEX idx_regions_active ON regions(is_active);
CREATE INDEX idx_regions_code ON regions(code);