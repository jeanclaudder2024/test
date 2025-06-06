-- OAuth Authentication Tables for Replit Auth
-- Please run these SQL commands in your database to update the schema

-- Sessions table for storing user sessions (required for OAuth)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);

-- Update the users table to support OAuth authentication
-- If users table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR DEFAULT 'user',
  subscription_status VARCHAR DEFAULT 'trial',
  trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '3 days'),
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- If users table exists but needs OAuth columns, add them:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR;
-- ALTER TABLE users ALTER COLUMN id TYPE VARCHAR;
-- ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Ensure we have an admin user for testing
INSERT INTO users (id, email, first_name, last_name, role, subscription_status, subscription_end_date)
VALUES ('admin', 'admin@petrodealhub.com', 'Admin', 'User', 'admin', 'active', NOW() + INTERVAL '1 year')
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  subscription_status = 'active',
  subscription_end_date = NOW() + INTERVAL '1 year';