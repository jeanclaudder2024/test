-- Simple users table for oil vessel tracking platform
-- Run this in your Supabase SQL Editor

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role
CREATE POLICY "Allow all for service role" ON users
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
FOR SELECT
USING (true);