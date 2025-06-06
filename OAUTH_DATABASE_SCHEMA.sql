-- OAuth Authentication Database Schema Update
-- Run these SQL commands in your database to implement OAuth authentication

-- 1. Create sessions table for OAuth session management
DROP TABLE IF EXISTS sessions CASCADE;
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IDX_session_expire ON sessions (expire);

-- 2. Backup existing users table (if it exists)
-- CREATE TABLE users_backup AS SELECT * FROM users WHERE 1=1;

-- 3. Update users table structure for OAuth compatibility
-- First, modify the existing users table to support OAuth
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add OAuth-required columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR;

-- Modify existing columns to be OAuth-compatible
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add unique constraint on provider_id for OAuth users
CREATE UNIQUE INDEX IF NOT EXISTS users_provider_id_unique ON users (provider_id) WHERE provider_id IS NOT NULL;

-- 4. Create a test OAuth user for development
INSERT INTO users (
  id, username, email, first_name, last_name, role, 
  subscription_status, trial_end_date, subscription_end_date, 
  provider_id, is_active, created_at, updated_at
) VALUES (
  999999, 'oauth_admin', 'admin@petrodealhub.com', 'OAuth', 'Admin', 'admin',
  'active', NOW() + INTERVAL '365 days', NOW() + INTERVAL '365 days',
  'oauth_admin_123', true, NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  subscription_status = 'active',
  subscription_end_date = NOW() + INTERVAL '365 days',
  provider_id = 'oauth_admin_123';

-- 5. Verify the schema changes
SELECT 'Schema update completed successfully' as status;