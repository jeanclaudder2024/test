-- Simple subscription plans update that matches actual schema
-- Check current plans
SELECT name, price, interval, stripe_product_id FROM subscription_plans;

-- Delete existing plans to avoid conflicts
DELETE FROM subscription_plans;

-- Insert subscription plans matching actual schema structure
INSERT INTO subscription_plans (
  name, 
  description, 
  price, 
  interval, 
  trial_days, 
  stripe_product_id, 
  stripe_price_id, 
  is_active, 
  features, 
  max_vessels, 
  max_ports, 
  max_refineries, 
  can_access_broker_features, 
  can_access_analytics, 
  can_export_data
) VALUES 
(
  'Starter', 
  'Perfect for small-scale maritime businesses and brokers just getting started', 
  29.00, 
  'month', 
  5, 
  'prod_starter_maritime', 
  'price_starter_maritime', 
  true, 
  '["Access to 50 vessels", "Basic port information", "Email support", "Standard API access", "Mobile app access"]'::jsonb, 
  50, 
  100, 
  20, 
  false, 
  false, 
  false
),
(
  'Professional', 
  'Advanced features for growing maritime operations and active brokers', 
  99.00, 
  'month', 
  5, 
  'prod_professional_maritime', 
  'price_professional_maritime', 
  true, 
  '["Access to 200 vessels", "Advanced vessel tracking", "Real-time market data", "Broker deal management", "Priority support", "API integration", "Data export (CSV/Excel)", "Advanced analytics dashboard"]'::jsonb, 
  200, 
  -1, 
  50, 
  true, 
  true, 
  true
),
(
  'Enterprise', 
  'Complete solution for large maritime corporations and professional brokers', 
  299.00, 
  'month', 
  5, 
  'prod_enterprise_maritime', 
  'price_enterprise_maritime', 
  true, 
  '["Unlimited vessels", "Full platform access", "Advanced analytics & AI insights", "International broker membership", "24/7 phone support", "Custom integrations", "Dedicated account manager", "Legal recognition and dispute protection", "Custom reporting", "White-label options"]'::jsonb, 
  -1, 
  -1, 
  -1, 
  true, 
  true, 
  true
);

-- Verify the data was inserted
SELECT name, price, interval, features FROM subscription_plans ORDER BY price;