-- Fix missing columns in database tables

-- Add missing column to refineries table
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS active_vessels INTEGER DEFAULT 0;

-- Fix brokers table - the column name should be elite_member, not eliteMember
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS elite_member BOOLEAN DEFAULT false;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS elite_member_since TIMESTAMP;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS elite_member_expires TIMESTAMP;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS membership_id TEXT;

-- Add missing columns to vessels table if they don't exist
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS oil_type TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS quantity DECIMAL(15,2);
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS deal_value DECIMAL(15,2);
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS loading_port TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS price DECIMAL(15,2);
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS market_price DECIMAL(15,2);
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS source_company TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS target_refinery TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS shipping_type TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS route_distance DECIMAL(10,2);