-- Create oil_companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS oil_companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  fleet_size INTEGER,
  founded_year INTEGER,
  headquarters TEXT,
  ceo TEXT,
  revenue TEXT,
  specialization TEXT,
  website TEXT,
  logo TEXT,
  description TEXT,
  major_routes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);