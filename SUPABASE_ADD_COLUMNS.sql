-- Simple column additions for Supabase ports table
-- Copy and paste each line individually in Supabase SQL Editor

-- Basic Information
ALTER TABLE ports ADD COLUMN city TEXT;
ALTER TABLE ports ADD COLUMN timezone TEXT;

-- Port Authority & Management
ALTER TABLE ports ADD COLUMN port_authority TEXT;
ALTER TABLE ports ADD COLUMN operator TEXT;
ALTER TABLE ports ADD COLUMN owner TEXT;

-- Contact Information
ALTER TABLE ports ADD COLUMN email TEXT;
ALTER TABLE ports ADD COLUMN phone TEXT;
ALTER TABLE ports ADD COLUMN website TEXT;
ALTER TABLE ports ADD COLUMN address TEXT;
ALTER TABLE ports ADD COLUMN postal_code TEXT;

-- Operational Information
ALTER TABLE ports ADD COLUMN annual_throughput INTEGER;
ALTER TABLE ports ADD COLUMN operating_hours TEXT;

-- Technical Specifications
ALTER TABLE ports ADD COLUMN max_vessel_length DECIMAL(8,2);
ALTER TABLE ports ADD COLUMN max_vessel_beam DECIMAL(6,2);
ALTER TABLE ports ADD COLUMN max_draught DECIMAL(5,2);
ALTER TABLE ports ADD COLUMN max_deadweight INTEGER;
ALTER TABLE ports ADD COLUMN berth_count INTEGER;
ALTER TABLE ports ADD COLUMN terminal_count INTEGER;

-- Water Depth & Navigation
ALTER TABLE ports ADD COLUMN channel_depth DECIMAL(5,2);
ALTER TABLE ports ADD COLUMN berth_depth DECIMAL(5,2);
ALTER TABLE ports ADD COLUMN anchorage_depth DECIMAL(5,2);

-- Services & Facilities
ALTER TABLE ports ADD COLUMN services TEXT;
ALTER TABLE ports ADD COLUMN facilities TEXT;
ALTER TABLE ports ADD COLUMN cargo_types TEXT;

-- Safety & Security
ALTER TABLE ports ADD COLUMN security_level TEXT;
ALTER TABLE ports ADD COLUMN pilotage_required BOOLEAN DEFAULT false;
ALTER TABLE ports ADD COLUMN tug_assistance BOOLEAN DEFAULT false;
ALTER TABLE ports ADD COLUMN quarantine_station BOOLEAN DEFAULT false;

-- Environmental & Regulatory
ALTER TABLE ports ADD COLUMN environmental_certifications TEXT;
ALTER TABLE ports ADD COLUMN customs_office BOOLEAN DEFAULT false;
ALTER TABLE ports ADD COLUMN free_trade_zone BOOLEAN DEFAULT false;

-- Infrastructure
ALTER TABLE ports ADD COLUMN rail_connection BOOLEAN DEFAULT false;
ALTER TABLE ports ADD COLUMN road_connection BOOLEAN DEFAULT true;
ALTER TABLE ports ADD COLUMN airport_distance DECIMAL(8,2);

-- Weather & Conditions
ALTER TABLE ports ADD COLUMN average_wait_time DECIMAL(5,2);
ALTER TABLE ports ADD COLUMN weather_restrictions TEXT;
ALTER TABLE ports ADD COLUMN tidal_range DECIMAL(4,2);

-- Economic Information
ALTER TABLE ports ADD COLUMN port_charges TEXT;
ALTER TABLE ports ADD COLUMN currency TEXT DEFAULT 'USD';

-- Connectivity
ALTER TABLE ports ADD COLUMN connected_refineries INTEGER DEFAULT 0;
ALTER TABLE ports ADD COLUMN nearby_ports TEXT;

-- Statistics
ALTER TABLE ports ADD COLUMN vessel_count INTEGER DEFAULT 0;
ALTER TABLE ports ADD COLUMN total_cargo DECIMAL(15,2) DEFAULT 0;

-- Metadata
ALTER TABLE ports ADD COLUMN established INTEGER;
ALTER TABLE ports ADD COLUMN last_inspection TIMESTAMP;
ALTER TABLE ports ADD COLUMN next_inspection TIMESTAMP;
ALTER TABLE ports ADD COLUMN photo TEXT;
ALTER TABLE ports ADD COLUMN created_at TIMESTAMP DEFAULT NOW();