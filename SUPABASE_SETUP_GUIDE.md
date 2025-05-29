# Supabase Database Setup - Oil Vessel Tracking Platform

## Quick Setup Instructions

1. **Go to your Supabase project dashboard**
2. **Click on "SQL Editor" in the left sidebar**
3. **Create a new query and paste the SQL below**
4. **Click "Run" to create all tables**

## SQL Commands to Run in Supabase

```sql
-- Create companies table
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

-- Create ports table
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

-- Create refineries table
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

-- Create vessels table
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
  departure_port INTEGER,
  destination_port INTEGER,
  departure_date TIMESTAMP,
  arrival_date TIMESTAMP,
  eta TIMESTAMP,
  company_id INTEGER,
  cargo_type VARCHAR(100),
  cargo_quantity INTEGER,
  oil_source VARCHAR(100),
  route_info TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vessel tracking table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vessels_mmsi ON vessels(mmsi);
CREATE INDEX IF NOT EXISTS idx_vessels_imo ON vessels(imo);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_ports_country ON ports(country);
CREATE INDEX IF NOT EXISTS idx_ports_region ON ports(region);
CREATE INDEX IF NOT EXISTS idx_refineries_country ON refineries(country);
CREATE INDEX IF NOT EXISTS idx_vessel_tracking_vessel_id ON vessel_tracking(vessel_id);
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