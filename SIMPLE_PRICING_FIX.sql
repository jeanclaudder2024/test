-- Simple Pricing Fix - Run this in Supabase SQL Editor

-- 1. Add missing pricing columns
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS "monthlyPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "yearlyPrice" DECIMAL(10,2);

-- 2. Update with correct pricing
UPDATE subscription_plans 
SET 
    "monthlyPrice" = 69.00,
    "yearlyPrice" = 690.00
WHERE id = 1;

UPDATE subscription_plans 
SET 
    "monthlyPrice" = 350.00,
    "yearlyPrice" = 3360.00
WHERE id = 2;

UPDATE subscription_plans 
SET 
    "monthlyPrice" = 399.00,
    "yearlyPrice" = 3990.00
WHERE id = 3;

-- 3. Verify the results
SELECT 
    id, 
    name, 
    "monthlyPrice",
    "yearlyPrice"
FROM subscription_plans 
ORDER BY id;