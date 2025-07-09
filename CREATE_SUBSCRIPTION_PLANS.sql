-- Create subscription plans table for authentication system
-- Copy and paste this in your Supabase SQL Editor

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  trial_days INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price, description, features, trial_days) 
VALUES 
  (1, 'Trial', 0.00, '3-day free trial', ARRAY['Basic vessel tracking', 'Limited port access'], 3),
  (2, 'Professional', 29.99, 'Monthly professional plan', ARRAY['Full vessel tracking', 'All ports access', 'Advanced analytics'], 30),
  (3, 'Enterprise', 99.99, 'Monthly enterprise plan', ARRAY['Everything in Professional', 'Priority support', 'Custom integrations'], 30)
ON CONFLICT (id) DO NOTHING;

-- Verify the table was created
SELECT * FROM subscription_plans ORDER BY id;