-- Enhanced Authentication System Database Update
-- This script updates the users table to support Google OAuth, email verification, and enhanced authentication

-- Add new columns to the users table for OAuth and email verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Make password optional for OAuth users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Create index for Google ID for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Create index for email verification token
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Create index for password reset token
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);

-- Update existing users to have email verified (for backward compatibility)
UPDATE users SET is_email_verified = true WHERE is_email_verified IS NULL;

-- Create or update subscription plans if they don't exist
INSERT INTO subscription_plans (id, name, description, price, interval, trial_days, features, can_access_broker_features, can_access_analytics, can_export_data)
VALUES 
  (1, 'Free Trial', '3-day trial with full access', 0.00, 'month', 3, '["vessel_tracking", "basic_analytics", "document_generation"]', false, true, false),
  (2, 'Basic', 'Basic maritime tracking', 29.99, 'month', 0, '["vessel_tracking", "basic_analytics"]', false, true, false),
  (3, 'Pro', 'Professional maritime platform', 99.99, 'month', 0, '["vessel_tracking", "advanced_analytics", "document_generation", "export_data"]', false, true, true),
  (4, 'Broker', 'Full broker functionality', 299.00, 'month', 0, '["vessel_tracking", "advanced_analytics", "document_generation", "export_data", "broker_features"]', true, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  can_access_broker_features = EXCLUDED.can_access_broker_features,
  can_access_analytics = EXCLUDED.can_access_analytics,
  can_export_data = EXCLUDED.can_export_data;

-- Ensure admin user has full access
UPDATE users SET role = 'admin' WHERE email = 'admin@petrodealhub.com';

-- Create admin subscription if it doesn't exist
INSERT INTO user_subscriptions (user_id, plan_id, status, trial_start_date, trial_end_date, current_period_start, current_period_end)
SELECT u.id, 4, 'active', NOW(), NOW() + INTERVAL '365 days', NOW(), NOW() + INTERVAL '365 days'
FROM users u 
WHERE u.email = 'admin@petrodealhub.com' 
AND NOT EXISTS (
  SELECT 1 FROM user_subscriptions us WHERE us.user_id = u.id
);

-- Print success message
SELECT 'Enhanced authentication database update completed successfully' as message;