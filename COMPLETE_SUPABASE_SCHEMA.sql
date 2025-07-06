-- ================================================
-- COMPLETE SUPABASE DATABASE SCHEMA
-- Maritime Oil Tracking Platform - PetroDealHub
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- SUBSCRIPTION & USER MANAGEMENT SYSTEM
-- ================================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    interval TEXT NOT NULL DEFAULT 'month',
    trial_days INTEGER DEFAULT 5,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    features JSONB,
    max_vessels INTEGER DEFAULT -1,
    max_ports INTEGER DEFAULT -1,
    max_refineries INTEGER DEFAULT -1,
    can_access_broker_features BOOLEAN DEFAULT false,
    can_access_analytics BOOLEAN DEFAULT false,
    can_export_data BOOLEAN DEFAULT false,
    slug TEXT UNIQUE,
    sort_order INTEGER DEFAULT 0,
    monthly_price DECIMAL(10,2),
    yearly_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    token TEXT,
    stripe_customer_id TEXT,
    is_email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Additional subscription fields for compatibility
    issubscribed BOOLEAN DEFAULT false,
    subscriptiontier TEXT,
    subscription TEXT,
    is_subscribed BOOLEAN DEFAULT false,
    subscription_tier TEXT DEFAULT 'free',
    subscription_id TEXT
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'trial',
    trial_start_date TIMESTAMP,
    trial_end_date TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment History
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    subscription_id INTEGER REFERENCES user_subscriptions(id),
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- CORE MARITIME DATA TABLES
-- ================================================

-- Vessels - Complete vessel tracking table
CREATE TABLE IF NOT EXISTS vessels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    imo TEXT NOT NULL UNIQUE,
    mmsi TEXT NOT NULL,
    vessel_type TEXT NOT NULL,
    flag TEXT NOT NULL,
    built INTEGER,
    deadweight INTEGER,
    current_lat DECIMAL(10,6),
    current_lng DECIMAL(10,6),
    departure_port TEXT,
    departure_date TIMESTAMP,
    departure_lat DECIMAL(10,6),
    departure_lng DECIMAL(10,6),
    destination_port TEXT,
    destination_lat DECIMAL(10,6),
    destination_lng DECIMAL(10,6),
    eta TIMESTAMP,
    cargo_type TEXT,
    cargo_capacity INTEGER,
    current_region TEXT,
    status TEXT DEFAULT 'underway',
    speed TEXT,
    buyer_name TEXT DEFAULT 'NA',
    seller_name TEXT,
    owner_name TEXT,
    operator_name TEXT,
    oil_source TEXT,
    oil_type TEXT,
    quantity DECIMAL(15,2),
    deal_value DECIMAL(15,2),
    loading_port TEXT,
    price DECIMAL(15,2),
    market_price DECIMAL(15,2),
    source_company TEXT,
    target_refinery TEXT,
    shipping_type TEXT,
    route_distance DECIMAL(10,2),
    callsign TEXT,
    course INTEGER,
    nav_status TEXT,
    draught DECIMAL(5,2),
    length DECIMAL(8,2),
    width DECIMAL(6,2),
    engine_power INTEGER,
    fuel_consumption DECIMAL(8,2),
    crew_size INTEGER,
    gross_tonnage INTEGER,
    metadata TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Refineries - Complete refinery management table
CREATE TABLE IF NOT EXISTS refineries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    lat TEXT NOT NULL,
    lng TEXT NOT NULL,
    capacity INTEGER,
    status TEXT DEFAULT 'active',
    description TEXT,
    operator TEXT,
    owner TEXT,
    type TEXT,
    products TEXT,
    year_built INTEGER,
    last_maintenance TIMESTAMP,
    next_maintenance TIMESTAMP,
    complexity TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    technical_specs TEXT,
    photo TEXT,
    city TEXT,
    last_updated TIMESTAMP,
    utilization TEXT,
    -- Technical Specifications
    distillation_capacity TEXT,
    conversion_capacity TEXT,
    hydrogen_capacity TEXT,
    sulfur_recovery TEXT,
    processing_units TEXT,
    storage_capacity TEXT,
    -- Financial Information
    investment_cost TEXT,
    operating_costs TEXT,
    revenue TEXT,
    profit_margin TEXT,
    market_share TEXT,
    -- Compliance & Regulations
    environmental_certifications TEXT,
    safety_record TEXT,
    workforce_size INTEGER,
    annual_throughput TEXT,
    crude_oil_sources TEXT,
    -- Strategic Information
    pipeline_connections TEXT,
    shipping_terminals TEXT,
    rail_connections TEXT,
    nearest_port TEXT,
    -- Additional Fields
    fuel_types TEXT,
    refinery_complexity TEXT,
    daily_throughput INTEGER,
    annual_revenue TEXT,
    employees_count INTEGER,
    established_year INTEGER,
    parent_company TEXT,
    safety_rating TEXT,
    environmental_rating TEXT,
    production_capacity INTEGER,
    maintenance_schedule TEXT,
    certifications TEXT,
    compliance_status TEXT,
    market_position TEXT,
    strategic_partnerships TEXT,
    expansion_plans TEXT,
    technology_upgrades TEXT,
    operational_efficiency TEXT,
    supply_chain_partners TEXT,
    distribution_network TEXT
);

-- Ports - Complete port management table
CREATE TABLE IF NOT EXISTS ports (
    id SERIAL PRIMARY KEY,
    -- Basic Information
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT,
    timezone TEXT,
    -- Geographic Coordinates
    lat DECIMAL(10,6) NOT NULL,
    lng DECIMAL(10,6) NOT NULL,
    -- Port Classification
    type TEXT DEFAULT 'commercial',
    status TEXT DEFAULT 'operational',
    -- Operational Information
    capacity INTEGER,
    annual_throughput INTEGER,
    operating_hours TEXT,
    description TEXT,
    -- Port Authority & Management
    port_authority TEXT,
    operator TEXT,
    owner TEXT,
    -- Contact Information
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    postal_code TEXT,
    -- Technical Specifications
    max_vessel_length DECIMAL(8,2),
    max_vessel_beam DECIMAL(6,2),
    max_draught DECIMAL(5,2),
    max_deadweight INTEGER,
    berth_count INTEGER,
    terminal_count INTEGER,
    -- Water Depth & Navigation
    channel_depth DECIMAL(5,2),
    berth_depth DECIMAL(5,2),
    anchorage_depth DECIMAL(5,2),
    -- Services & Facilities
    services TEXT,
    facilities TEXT,
    cargo_types TEXT,
    -- Safety & Security
    security_level TEXT,
    pilotage_required BOOLEAN DEFAULT false,
    tug_assistance BOOLEAN DEFAULT false,
    quarantine_station BOOLEAN DEFAULT false,
    -- Environmental & Regulatory
    environmental_certifications TEXT,
    customs_office BOOLEAN DEFAULT false,
    free_trade_zone BOOLEAN DEFAULT false,
    -- Infrastructure
    rail_connection BOOLEAN DEFAULT false,
    road_connection BOOLEAN DEFAULT true,
    airport_distance DECIMAL(8,2),
    -- Weather & Conditions
    average_wait_time DECIMAL(5,2),
    weather_restrictions TEXT,
    tidal_range DECIMAL(4,2),
    -- Economic Information
    port_charges TEXT,
    currency TEXT DEFAULT 'USD',
    -- Connectivity
    connected_refineries INTEGER DEFAULT 0,
    nearby_ports TEXT,
    -- Statistics
    vessel_count INTEGER DEFAULT 0,
    total_cargo DECIMAL(15,2) DEFAULT 0,
    -- Metadata
    established INTEGER,
    last_inspection TIMESTAMP,
    next_inspection TIMESTAMP,
    photo TEXT,
    -- System fields
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Oil Types Management
CREATE TABLE IF NOT EXISTS oil_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL,
    api_gravity DECIMAL(5,2),
    sulfur_content DECIMAL(5,3),
    viscosity DECIMAL(8,2),
    density DECIMAL(8,4),
    flash_point INTEGER,
    pour_point INTEGER,
    market_price DECIMAL(10,2),
    price_unit TEXT DEFAULT 'barrel',
    description TEXT,
    common_uses TEXT,
    major_producers TEXT,
    trading_symbol TEXT,
    hs_code TEXT,
    un_class TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Progress Events
CREATE TABLE IF NOT EXISTS progress_events (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    event TEXT NOT NULL,
    lat DECIMAL(10,6),
    lng DECIMAL(10,6),
    location TEXT
);

-- Brokers
CREATE TABLE IF NOT EXISTS brokers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    active BOOLEAN DEFAULT true,
    elite_member BOOLEAN DEFAULT false,
    elite_member_since TIMESTAMP,
    elite_member_expires TIMESTAMP,
    membership_id TEXT,
    shipping_address TEXT,
    subscription_plan TEXT,
    last_login TIMESTAMP
);

-- Stats
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    active_vessels INTEGER DEFAULT 0,
    total_cargo DECIMAL(15,2) DEFAULT 0,
    active_refineries INTEGER DEFAULT 0,
    active_brokers INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Real Companies
CREATE TABLE IF NOT EXISTS real_companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'Oil',
    address TEXT NOT NULL,
    logo TEXT,
    description TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    email TEXT,
    founded INTEGER,
    employees INTEGER,
    revenue TEXT,
    headquarters TEXT,
    ceo TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fake Companies
CREATE TABLE IF NOT EXISTS fake_companies (
    id SERIAL PRIMARY KEY,
    real_company_id INTEGER NOT NULL REFERENCES real_companies(id),
    generated_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- DOCUMENT MANAGEMENT SYSTEM
-- ================================================

-- Document Templates (for AI-powered document generation)
CREATE TABLE IF NOT EXISTS document_templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated Documents
CREATE TABLE IF NOT EXISTS generated_documents (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL REFERENCES vessels(id),
    template_id INTEGER NOT NULL REFERENCES document_templates(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_type TEXT DEFAULT 'pdf',
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Vessels indexes
CREATE INDEX IF NOT EXISTS idx_vessels_imo ON vessels(imo);
CREATE INDEX IF NOT EXISTS idx_vessels_mmsi ON vessels(mmsi);
CREATE INDEX IF NOT EXISTS idx_vessels_vessel_type ON vessels(vessel_type);
CREATE INDEX IF NOT EXISTS idx_vessels_current_region ON vessels(current_region);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_vessels_destination_port ON vessels(destination_port);

-- Ports indexes
CREATE INDEX IF NOT EXISTS idx_ports_country ON ports(country);
CREATE INDEX IF NOT EXISTS idx_ports_region ON ports(region);
CREATE INDEX IF NOT EXISTS idx_ports_type ON ports(type);
CREATE INDEX IF NOT EXISTS idx_ports_status ON ports(status);

-- Refineries indexes
CREATE INDEX IF NOT EXISTS idx_refineries_country ON refineries(country);
CREATE INDEX IF NOT EXISTS idx_refineries_region ON refineries(region);
CREATE INDEX IF NOT EXISTS idx_refineries_status ON refineries(status);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Oil types indexes
CREATE INDEX IF NOT EXISTS idx_oil_types_category ON oil_types(category);
CREATE INDEX IF NOT EXISTS idx_oil_types_is_active ON oil_types(is_active);

-- ================================================
-- INSERT DEFAULT DATA
-- ================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, trial_days, features, can_access_broker_features, can_access_analytics, can_export_data, slug, sort_order)
VALUES 
    ('Free Trial', '5-day free trial with basic features', 0.00, 5, '["basic_tracking", "limited_vessel_access"]', false, false, false, 'free-trial', 1),
    ('Basic', 'Basic maritime tracking plan', 29.99, 5, '["vessel_tracking", "port_data", "basic_analytics"]', false, true, false, 'basic', 2),
    ('Pro', 'Professional maritime operations', 79.99, 5, '["unlimited_vessels", "advanced_analytics", "data_export", "priority_support"]', true, true, true, 'pro', 3),
    ('Enterprise', 'Enterprise-grade maritime intelligence', 199.99, 5, '["white_label", "api_access", "custom_integrations", "dedicated_support"]', true, true, true, 'enterprise', 4)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    trial_days = EXCLUDED.trial_days,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Insert default oil types
INSERT INTO oil_types (name, display_name, category, description, trading_symbol, is_active)
VALUES 
    ('crude_oil', 'Crude Oil', 'crude', 'Unrefined petroleum oil', 'CRUDE', true),
    ('brent_crude', 'Brent Crude Oil', 'crude', 'North Sea crude oil benchmark', 'BRENT', true),
    ('wti_crude', 'West Texas Intermediate', 'crude', 'Light sweet crude oil benchmark', 'WTI', true),
    ('lng', 'Liquefied Natural Gas', 'lng', 'Natural gas in liquid form', 'LNG', true),
    ('lpg', 'Liquefied Petroleum Gas', 'lpg', 'Propane and butane mixture', 'LPG', true),
    ('gasoline', 'Gasoline', 'refined', 'Motor fuel', 'GAS', true),
    ('diesel', 'Diesel Fuel', 'refined', 'Diesel engine fuel', 'DIESEL', true),
    ('jet_fuel', 'Jet Fuel', 'refined', 'Aviation turbine fuel', 'JET', true),
    ('heavy_fuel_oil', 'Heavy Fuel Oil', 'refined', 'Marine bunker fuel', 'HFO', true),
    ('marine_gas_oil', 'Marine Gas Oil', 'refined', 'Marine distillate fuel', 'MGO', true)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    trading_symbol = EXCLUDED.trading_symbol,
    updated_at = NOW();

-- Insert default document templates
INSERT INTO document_templates (name, description, category)
VALUES 
    ('Vessel Certificate', 'Generate professional vessel certification documents', 'certification'),
    ('Cargo Manifest', 'Create detailed cargo manifest for maritime transport', 'cargo'),
    ('Port Clearance', 'Generate port clearance documentation', 'port'),
    ('Bill of Lading', 'Create bill of lading for cargo shipments', 'shipping'),
    ('Maritime Survey Report', 'Professional maritime survey and inspection report', 'survey'),
    ('Charter Party Agreement', 'Vessel charter party contract template', 'contract')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

-- Add a completion indicator
CREATE TABLE IF NOT EXISTS schema_info (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_info (version, description)
VALUES ('1.0.0', 'Complete PetroDealHub maritime tracking platform schema')
ON CONFLICT (version) DO UPDATE SET
    applied_at = NOW(),
    description = EXCLUDED.description;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'PetroDealHub Database Schema Applied Successfully!';
    RAISE NOTICE 'Tables created: %, %, %, %, %, %, %, %, %, %, %, %, %', 
        'subscription_plans', 'users', 'user_subscriptions', 'payments',
        'vessels', 'refineries', 'ports', 'oil_types', 'progress_events',
        'brokers', 'stats', 'real_companies', 'fake_companies';
    RAISE NOTICE 'Document system: %, %', 'document_templates', 'generated_documents';
    RAISE NOTICE 'Default data inserted for subscription plans, oil types, and document templates';
END $$;