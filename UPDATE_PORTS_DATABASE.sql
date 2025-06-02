-- Complete Ports Table Update Script for Supabase
-- Run this in your Supabase SQL Editor to add all comprehensive port management columns

-- Basic Information (additional fields)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'city') THEN
        ALTER TABLE ports ADD COLUMN city TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'timezone') THEN
        ALTER TABLE ports ADD COLUMN timezone TEXT;
    END IF;
END $$;

-- Port Authority & Management
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'port_authority') THEN
        ALTER TABLE ports ADD COLUMN port_authority TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'operator') THEN
        ALTER TABLE ports ADD COLUMN operator TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'owner') THEN
        ALTER TABLE ports ADD COLUMN owner TEXT;
    END IF;
END $$;

-- Contact Information
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'email') THEN
        ALTER TABLE ports ADD COLUMN email TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'phone') THEN
        ALTER TABLE ports ADD COLUMN phone TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'website') THEN
        ALTER TABLE ports ADD COLUMN website TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'address') THEN
        ALTER TABLE ports ADD COLUMN address TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'postal_code') THEN
        ALTER TABLE ports ADD COLUMN postal_code TEXT;
    END IF;
END $$;

-- Operational Information
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'annual_throughput') THEN
        ALTER TABLE ports ADD COLUMN annual_throughput INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'operating_hours') THEN
        ALTER TABLE ports ADD COLUMN operating_hours TEXT;
    END IF;
END $$;

-- Technical Specifications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'max_vessel_length') THEN
        ALTER TABLE ports ADD COLUMN max_vessel_length DECIMAL(8,2);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'max_vessel_beam') THEN
        ALTER TABLE ports ADD COLUMN max_vessel_beam DECIMAL(6,2);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'max_draught') THEN
        ALTER TABLE ports ADD COLUMN max_draught DECIMAL(5,2);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'max_deadweight') THEN
        ALTER TABLE ports ADD COLUMN max_deadweight INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'berth_count') THEN
        ALTER TABLE ports ADD COLUMN berth_count INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'terminal_count') THEN
        ALTER TABLE ports ADD COLUMN terminal_count INTEGER;
    END IF;
END $$;

-- Water Depth & Navigation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'channel_depth') THEN
        ALTER TABLE ports ADD COLUMN channel_depth DECIMAL(5,2);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'berth_depth') THEN
        ALTER TABLE ports ADD COLUMN berth_depth DECIMAL(5,2);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'anchorage_depth') THEN
        ALTER TABLE ports ADD COLUMN anchorage_depth DECIMAL(5,2);
    END IF;
END $$;

-- Services & Facilities (JSON arrays stored as TEXT)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'services') THEN
        ALTER TABLE ports ADD COLUMN services TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'facilities') THEN
        ALTER TABLE ports ADD COLUMN facilities TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'cargo_types') THEN
        ALTER TABLE ports ADD COLUMN cargo_types TEXT;
    END IF;
END $$;

-- Safety & Security
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'security_level') THEN
        ALTER TABLE ports ADD COLUMN security_level TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'pilotage_required') THEN
        ALTER TABLE ports ADD COLUMN pilotage_required BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'tug_assistance') THEN
        ALTER TABLE ports ADD COLUMN tug_assistance BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'quarantine_station') THEN
        ALTER TABLE ports ADD COLUMN quarantine_station BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Environmental & Regulatory
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'environmental_certifications') THEN
        ALTER TABLE ports ADD COLUMN environmental_certifications TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'customs_office') THEN
        ALTER TABLE ports ADD COLUMN customs_office BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'free_trade_zone') THEN
        ALTER TABLE ports ADD COLUMN free_trade_zone BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Infrastructure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'rail_connection') THEN
        ALTER TABLE ports ADD COLUMN rail_connection BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'road_connection') THEN
        ALTER TABLE ports ADD COLUMN road_connection BOOLEAN DEFAULT true;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'airport_distance') THEN
        ALTER TABLE ports ADD COLUMN airport_distance DECIMAL(8,2);
    END IF;
END $$;

-- Weather & Conditions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'average_wait_time') THEN
        ALTER TABLE ports ADD COLUMN average_wait_time DECIMAL(5,2);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'weather_restrictions') THEN
        ALTER TABLE ports ADD COLUMN weather_restrictions TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'tidal_range') THEN
        ALTER TABLE ports ADD COLUMN tidal_range DECIMAL(4,2);
    END IF;
END $$;

-- Economic Information
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'port_charges') THEN
        ALTER TABLE ports ADD COLUMN port_charges TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'currency') THEN
        ALTER TABLE ports ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
END $$;

-- Connectivity
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'connected_refineries') THEN
        ALTER TABLE ports ADD COLUMN connected_refineries INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'nearby_ports') THEN
        ALTER TABLE ports ADD COLUMN nearby_ports TEXT;
    END IF;
END $$;

-- Statistics
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'vessel_count') THEN
        ALTER TABLE ports ADD COLUMN vessel_count INTEGER DEFAULT 0;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'total_cargo') THEN
        ALTER TABLE ports ADD COLUMN total_cargo DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Metadata
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'established') THEN
        ALTER TABLE ports ADD COLUMN established INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'last_inspection') THEN
        ALTER TABLE ports ADD COLUMN last_inspection TIMESTAMP;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'next_inspection') THEN
        ALTER TABLE ports ADD COLUMN next_inspection TIMESTAMP;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'photo') THEN
        ALTER TABLE ports ADD COLUMN photo TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ports' AND column_name = 'created_at') THEN
        ALTER TABLE ports ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Verify the updates
SELECT 'Database update completed. Checking ports table structure...' AS status;

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'ports' 
ORDER BY ordinal_position;