-- Create subscription plans table and insert professional plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  interval TEXT NOT NULL DEFAULT 'month',
  trial_days INTEGER DEFAULT 5,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  features JSONB,
  max_vessels INTEGER DEFAULT -1,
  max_ports INTEGER DEFAULT -1,
  max_refineries INTEGER DEFAULT -1,
  can_access_broker_features BOOLEAN DEFAULT false,
  can_access_analytics BOOLEAN DEFAULT false,
  can_export_data BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clear existing plans and insert professional subscription plans
DELETE FROM subscription_plans;

-- Insert the three professional subscription plans
INSERT INTO subscription_plans (
  id, name, description, price, interval, trial_days, is_active, 
  features, max_vessels, max_ports, max_refineries, 
  can_access_broker_features, can_access_analytics, can_export_data
) VALUES 
(1, '🧪 Basic', 'Perfect for independent brokers starting in petroleum markets', 69.00, 'month', 5, true,
 '["Access to 2 major maritime zones", "Basic vessel tracking with verified activity", "Access to 5 regional ports", "Basic documentation: LOI, SPA", "Email support"]'::jsonb,
 50, 5, 10, false, false, false),

(2, '📈 Professional', 'Professional brokers and medium-scale petroleum trading companies', 150.00, 'month', 5, true,
 '["Access to 6 major maritime zones", "Enhanced tracking with real-time updates", "Access to 20+ strategic ports", "Enhanced documentation: LOI, B/L, SPA, ICPO", "Basic broker features + deal participation", "Priority email support"]'::jsonb,
 200, 20, 50, true, true, false),

(3, '🏢 Enterprise', 'Full-scale solution for large petroleum trading corporations', 399.00, 'month', 5, true,
 '["Access to 9 major global maritime zones", "Full live tracking with verified activity", "Access to 100+ strategic global ports", "Full set: SGS, SDS, Q88, ATB, customs", "International Broker ID included", "Legal recognition and dispute protection", "24/7 premium support + account manager"]'::jsonb,
 -1, -1, -1, true, true, true);

-- Reset sequence to start from 4
SELECT setval('subscription_plans_id_seq', 3, true);