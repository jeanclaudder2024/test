-- COMPLETE DATABASE SCHEMA UPDATE FOR PETRODEALHUB
-- This script includes all missing tables and columns
-- Run this against your Supabase database to fix all schema issues

-- ======================================
-- 1. UPDATE REFINERIES TABLE
-- ======================================
-- Add missing columns to refineries table
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS latitude TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS longitude TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS crude_oil_sources TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS processing_units TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS storage_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS pipeline_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS shipping_terminals TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS rail_connections TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS nearest_port TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS nearest_port_distance TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS distillation_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS conversion_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS hydrogen_capacity TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS sulfur_recovery TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS investment_cost TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS operating_costs TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS revenue TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS profit_margin TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS market_share TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS environmental_certifications TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS safety_record TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS workforce_size INTEGER;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS annual_throughput TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS crude_specifications TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS gasoline_specifications TEXT;
ALTER TABLE refineries ADD COLUMN IF NOT EXISTS diesel_specifications TEXT;

-- ======================================
-- 2. UPDATE VESSELS TABLE
-- ======================================
-- Add missing columns to vessels table
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS quantity TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS dealValue TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS marketPrice TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS routeDistance TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS currentPort TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS vesselStatus TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS beam TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS draft TEXT;

-- ======================================
-- 3. UPDATE USERS TABLE
-- ======================================
-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS isSubscribed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscriptionTier TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription JSONB;

-- ======================================
-- 4. UPDATE SUBSCRIPTION_PLANS TABLE
-- ======================================
-- Add missing columns to subscription_plans table
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS sortOrder INTEGER;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS monthlyPrice DECIMAL(10,2);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS yearlyPrice DECIMAL(10,2);

-- ======================================
-- 5. UPDATE BROKER_DEALS TABLE
-- ======================================
-- Add missing columns to broker_deals table
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS requestedAmount TEXT;
ALTER TABLE broker_deals ADD COLUMN IF NOT EXISTS deliveryDate TIMESTAMP;

-- ======================================
-- 6. CREATE MISSING TABLES
-- ======================================

-- Create vessel_document_associations table
CREATE TABLE IF NOT EXISTS vessel_document_associations (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER REFERENCES vessels(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vessel_id, document_id)
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status TEXT DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    billing_interval TEXT DEFAULT 'monthly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- 7. FIX DATA TYPE ISSUES
-- ======================================

-- Convert numeric fields to TEXT where needed
ALTER TABLE ports ALTER COLUMN totalCargo TYPE TEXT USING totalCargo::TEXT;
ALTER TABLE refineries ALTER COLUMN totalCargo TYPE TEXT USING totalCargo::TEXT;

-- ======================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ======================================

-- Indexes for vessel_document_associations
CREATE INDEX IF NOT EXISTS idx_vessel_document_associations_vessel_id ON vessel_document_associations(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_document_associations_document_id ON vessel_document_associations(document_id);

-- Indexes for user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Indexes for vessels
CREATE INDEX IF NOT EXISTS idx_vessels_current_port ON vessels(currentPort);
CREATE INDEX IF NOT EXISTS idx_vessels_vessel_status ON vessels(vesselStatus);

-- ======================================
-- 9. UPDATE CONSTRAINTS
-- ======================================

-- Ensure unique constraint on subscription_plans name
ALTER TABLE subscription_plans 
ADD CONSTRAINT subscription_plans_name_key UNIQUE (name) 
ON CONFLICT DO NOTHING;

-- ======================================
-- 10. CREATE TRIGGERS FOR UPDATED_AT
-- ======================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to new tables
CREATE TRIGGER update_vessel_document_associations_updated_at 
    BEFORE UPDATE ON vessel_document_associations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================
-- 11. ADD MISSING DOCUMENT TEMPLATE COLUMNS
-- ======================================
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ======================================
-- 12. VERIFY AND REPORT
-- ======================================
-- After running this script, you can verify the changes with:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'refineries';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vessels';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';