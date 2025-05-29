-- Supabase Migration for Oil Vessel Tracking Platform
-- Creates all necessary tables with proper relationships and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for Supabase Auth integration)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
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

-- Port connections (many-to-many relationship)
CREATE TABLE IF NOT EXISTS port_connections (
  id SERIAL PRIMARY KEY,
  from_port_id INTEGER REFERENCES ports(id),
  to_port_id INTEGER REFERENCES ports(id),
  distance_km INTEGER,
  travel_time_hours INTEGER,
  route_info TEXT,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vessels_mmsi ON vessels(mmsi);
CREATE INDEX IF NOT EXISTS idx_vessels_imo ON vessels(imo);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_vessels_company ON vessels(company_id);
CREATE INDEX IF NOT EXISTS idx_ports_country ON ports(country);
CREATE INDEX IF NOT EXISTS idx_ports_region ON ports(region);
CREATE INDEX IF NOT EXISTS idx_refineries_country ON refineries(country);
CREATE INDEX IF NOT EXISTS idx_vessel_tracking_vessel_id ON vessel_tracking(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_tracking_timestamp ON vessel_tracking(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE refineries ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all data" ON vessels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all ports" ON ports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all refineries" ON refineries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view all companies" ON companies FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update data
CREATE POLICY "Authenticated users can insert vessels" ON vessels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update vessels" ON vessels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ports" ON ports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert refineries" ON refineries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert companies" ON companies FOR INSERT TO authenticated WITH CHECK (true);

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON vessels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ports_updated_at BEFORE UPDATE ON ports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refineries_updated_at BEFORE UPDATE ON refineries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vessel_jobs_updated_at BEFORE UPDATE ON vessel_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();