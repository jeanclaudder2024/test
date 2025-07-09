-- Manual Database Update for Enhanced Authentication
-- Copy and paste these commands one by one in your Supabase SQL Editor

-- First, add the missing columns one by one
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Make password optional for OAuth users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);

-- Update existing users to have email verified
UPDATE users SET is_email_verified = true WHERE is_email_verified IS NULL OR is_email_verified = false;

-- Verify the update worked
SELECT 'Authentication columns added successfully' as status;

-- Check the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('google_id', 'avatar_url', 'provider', 'email_verification_expires', 'is_email_verified', 'email_verification_token', 'reset_password_token', 'reset_password_expires', 'last_login_at')
ORDER BY column_name;