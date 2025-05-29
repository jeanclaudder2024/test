-- Setup Supabase Database Tables for Oil Vessel Tracking
-- Run this SQL in your Supabase SQL editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vessels table
CREATE TABLE IF NOT EXISTS vessels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  imo VARCHAR(50),
  mmsi VARCHAR(50),
  vessel_type VARCHAR(100),
  flag VARCHAR(100),
  built INTEGER,
  deadweight INTEGER,
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  departure_port VARCHAR(255),
  destination_port VARCHAR(255),
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  departure_lat DECIMAL(10, 8),
  departure_lng DECIMAL(11, 8),
  cargo_type VARCHAR(255),
  cargo_capacity INTEGER,
  current_region VARCHAR(100),
  status VARCHAR(100),
  speed VARCHAR(50),
  buyer_name VARCHAR(255),
  seller_name VARCHAR(255),
  departure_date TIMESTAMP,
  eta TIMESTAMP,
  metadata TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ports table
CREATE TABLE IF NOT EXISTS ports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  lat VARCHAR(50),
  lng VARCHAR(50),
  type VARCHAR(100),
  status VARCHAR(100),
  description TEXT,
  capacity INTEGER,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create refineries table
CREATE TABLE IF NOT EXISTS refineries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  lat VARCHAR(50),
  lng VARCHAR(50),
  type VARCHAR(100),
  status VARCHAR(100),
  description TEXT,
  capacity INTEGER,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),
  type VARCHAR(100),
  description TEXT,
  founded INTEGER,
  employees INTEGER,
  revenue DECIMAL(15, 2),
  website VARCHAR(255),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vessel_refinery_connections table
CREATE TABLE IF NOT EXISTS vessel_refinery_connections (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER REFERENCES vessels(id),
  refinery_id INTEGER REFERENCES refineries(id),
  status VARCHAR(100),
  connection_type VARCHAR(100),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  cargo_volume VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create refinery_port_connections table
CREATE TABLE IF NOT EXISTS refinery_port_connections (
  id SERIAL PRIMARY KEY,
  refinery_id INTEGER REFERENCES refineries(id),
  port_id INTEGER REFERENCES ports(id),
  distance_km DECIMAL(10, 2),
  connection_type VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stats table
CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  total_vessels INTEGER DEFAULT 0,
  total_refineries INTEGER DEFAULT 0,
  total_ports INTEGER DEFAULT 0,
  total_companies INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create progress_events table
CREATE TABLE IF NOT EXISTS progress_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(100),
  vessel_id INTEGER REFERENCES vessels(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create brokers table
CREATE TABLE IF NOT EXISTS brokers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  region VARCHAR(100),
  specialization TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial stats record
INSERT INTO stats (total_vessels, total_refineries, total_ports, total_companies, last_updated)
VALUES (0, 0, 0, 0, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vessels_region ON vessels(current_region);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_ports_region ON ports(region);
CREATE INDEX IF NOT EXISTS idx_refineries_region ON refineries(region);
CREATE INDEX IF NOT EXISTS idx_vessel_refinery_connections_vessel ON vessel_refinery_connections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_refinery_connections_refinery ON vessel_refinery_connections(refinery_id);