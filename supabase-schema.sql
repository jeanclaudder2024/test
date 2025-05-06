-- Create full schema for our maritime application in Supabase
-- Run this script in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  is_subscribed BOOLEAN,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  provider TEXT,
  provider_id TEXT,
  photo_url TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vessels table
CREATE TABLE IF NOT EXISTS vessels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  imo TEXT NOT NULL UNIQUE,
  mmsi TEXT NOT NULL,
  vessel_type TEXT NOT NULL,
  flag TEXT NOT NULL,
  built INTEGER,
  deadweight INTEGER,
  current_lat DECIMAL(10, 6),
  current_lng DECIMAL(10, 6),
  departure_port TEXT,
  departure_date TIMESTAMP WITH TIME ZONE,
  departure_lat DECIMAL(10, 6),
  departure_lng DECIMAL(10, 6),
  destination_port TEXT,
  destination_lat DECIMAL(10, 6),
  destination_lng DECIMAL(10, 6),
  eta TIMESTAMP WITH TIME ZONE,
  cargo_type TEXT,
  cargo_capacity INTEGER,
  current_region TEXT,
  buyer_name TEXT DEFAULT 'NA',
  seller_name TEXT,
  metadata TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refineries table
CREATE TABLE IF NOT EXISTS refineries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  capacity INTEGER,
  status TEXT DEFAULT 'active',
  description TEXT
);

-- Ports table
CREATE TABLE IF NOT EXISTS ports (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  type TEXT DEFAULT 'commercial',
  capacity INTEGER,
  status TEXT DEFAULT 'active',
  description TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Events table
CREATE TABLE IF NOT EXISTS progress_events (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  event TEXT NOT NULL,
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  location TEXT
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  reference TEXT,
  issuer TEXT,
  recipient_name TEXT,
  recipient_org TEXT,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brokers table
CREATE TABLE IF NOT EXISTS brokers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  active BOOLEAN DEFAULT TRUE,
  elite_member BOOLEAN DEFAULT FALSE,
  elite_member_since TIMESTAMP WITH TIME ZONE,
  elite_member_expires TIMESTAMP WITH TIME ZONE,
  membership_id TEXT,
  shipping_address TEXT,
  subscription_plan TEXT,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Stats table
CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  active_vessels INTEGER DEFAULT 0,
  total_cargo DECIMAL(15, 2) DEFAULT 0,
  active_refineries INTEGER DEFAULT 0,
  active_brokers INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  region TEXT,
  headquarters TEXT,
  founded_year INTEGER,
  ceo TEXT,
  fleet_size INTEGER,
  specialization TEXT,
  website TEXT,
  logo TEXT,
  description TEXT,
  revenue DECIMAL(15, 2),
  employees INTEGER,
  publicly_traded BOOLEAN DEFAULT FALSE,
  stock_symbol TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refinery-Port Connections table
CREATE TABLE IF NOT EXISTS refinery_port_connections (
  id SERIAL PRIMARY KEY,
  refinery_id INTEGER NOT NULL REFERENCES refineries(id) ON DELETE CASCADE,
  port_id INTEGER NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
  distance DECIMAL(10, 2),
  connection_type TEXT DEFAULT 'pipeline',
  capacity DECIMAL(15, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  monthly_price_id TEXT NOT NULL,
  yearly_price_id TEXT NOT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL,
  yearly_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  features TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  trial_days INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  billing_interval TEXT NOT NULL DEFAULT 'month',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  last4 TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  billing_reason TEXT,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security setup
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE refineries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE refinery_port_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for service role operations
CREATE POLICY service_role_policy ON users USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON vessels USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON refineries USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON ports USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON progress_events USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON documents USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON brokers USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON stats USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON companies USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON refinery_port_connections USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON subscription_plans USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON subscriptions USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON payment_methods USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY service_role_policy ON invoices USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');