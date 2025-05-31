-- Add new deal information fields to vessels table
-- Run this in your Supabase SQL Editor

ALTER TABLE vessels 
ADD COLUMN IF NOT EXISTS oil_type TEXT,
ADD COLUMN IF NOT EXISTS quantity DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS loading_port TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS market_price DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS source_company TEXT,
ADD COLUMN IF NOT EXISTS target_refinery TEXT,
ADD COLUMN IF NOT EXISTS shipping_type TEXT,
ADD COLUMN IF NOT EXISTS route_distance DECIMAL(10,2);