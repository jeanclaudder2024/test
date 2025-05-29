# Supabase Database Setup - Oil Vessel Tracking Platform

## Quick Setup Instructions

1. **Go to your Supabase project dashboard**
2. **Click on "SQL Editor" in the left sidebar**
3. **Create a new query and paste the SQL below**
4. **Click "Run" to create all tables**

## COMPLETE SQL Commands - ALL TABLES

```sql
-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  company_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),
  description TEXT,
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  company_type VARCHAR(100) DEFAULT 'shipping',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brokers table
CREATE TABLE IF NOT EXISTS brokers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  country VARCHAR(100),
  region VARCHAR(100),
  specialization TEXT,
  commission_rate DECIMAL(5,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ports table
CREATE TABLE IF NOT EXISTS ports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  port_type VARCHAR(100),
  capacity INTEGER,
  description TEXT,
  facilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refineries table
CREATE TABLE IF NOT EXISTS refineries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  capacity INTEGER,
  products TEXT[],
  description TEXT,
  processing_capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vessels table
CREATE TABLE IF NOT EXISTS vessels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mmsi VARCHAR(20) UNIQUE,
  imo VARCHAR(20) UNIQUE,
  vessel_type VARCHAR(100),
  flag VARCHAR(100),
  built INTEGER,
  deadweight INTEGER,
  cargo_capacity INTEGER,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  speed VARCHAR(20),
  status VARCHAR(100),
  departure_port INTEGER REFERENCES ports(id),
  destination_port INTEGER REFERENCES ports(id),
  departure_date TIMESTAMP,
  arrival_date TIMESTAMP,
  eta TIMESTAMP,
  company_id INTEGER REFERENCES companies(id),
  cargo_type VARCHAR(100),
  cargo_quantity INTEGER,
  oil_source VARCHAR(100),
  route_info TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vessel tracking history
CREATE TABLE IF NOT EXISTS vessel_tracking (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER REFERENCES vessels(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  speed VARCHAR(20),
  heading VARCHAR(20),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vessel jobs/assignments
CREATE TABLE IF NOT EXISTS vessel_jobs (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER REFERENCES vessels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  from_port_id INTEGER REFERENCES ports(id),
  to_port_id INTEGER REFERENCES ports(id),
  cargo_type VARCHAR(100),
  cargo_quantity INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  broker_id INTEGER REFERENCES brokers(id),
  commission DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Port connections (shipping routes)
CREATE TABLE IF NOT EXISTS port_connections (
  id SERIAL PRIMARY KEY,
  from_port_id INTEGER REFERENCES ports(id),
  to_port_id INTEGER REFERENCES ports(id),
  distance_km INTEGER,
  travel_time_hours INTEGER,
  route_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Oil pricing data
CREATE TABLE IF NOT EXISTS oil_prices (
  id SERIAL PRIMARY KEY,
  oil_type VARCHAR(100) NOT NULL,
  price_per_barrel DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  date_recorded DATE DEFAULT CURRENT_DATE,
  source VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  billing_interval VARCHAR(20) DEFAULT 'monthly',
  features TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  billing_interval VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER REFERENCES vessels(id),
  document_type VARCHAR(100),
  title VARCHAR(255),
  content TEXT,
  file_path VARCHAR(500),
  generated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  response TEXT,
  vessel_id INTEGER REFERENCES vessels(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_vessels_mmsi ON vessels(mmsi);
CREATE INDEX IF NOT EXISTS idx_vessels_imo ON vessels(imo);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_vessels_company ON vessels(company_id);
CREATE INDEX IF NOT EXISTS idx_ports_country ON ports(country);
CREATE INDEX IF NOT EXISTS idx_ports_region ON ports(region);
CREATE INDEX IF NOT EXISTS idx_refineries_country ON refineries(country);
CREATE INDEX IF NOT EXISTS idx_vessel_tracking_vessel_id ON vessel_tracking(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_tracking_timestamp ON vessel_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_vessel_jobs_vessel_id ON vessel_jobs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_jobs_status ON vessel_jobs(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
```

## What This Creates

✅ **Companies** - Oil shipping companies database  
✅ **Ports** - Global maritime terminals and oil ports  
✅ **Refineries** - Oil processing facilities worldwide  
✅ **Vessels** - Oil tankers and cargo ships  
✅ **Vessel Tracking** - Real-time position history  
✅ **Indexes** - Fast search and filtering  

## After Running the SQL

Your oil vessel tracking platform will have:
- Complete database structure ready for data
- Real-time vessel tracking capabilities
- Professional oil industry data management
- Fast search and filtering with indexes

Once you run this SQL in your Supabase dashboard, your app will be fully operational with a powerful, reliable database backend!