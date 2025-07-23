-- Fix Subscription Pricing Columns
-- Run these commands in your Supabase SQL editor to fix the pricing issues

-- 1. Add missing pricing columns to subscription_plans table
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS "monthlyPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "yearlyPrice" DECIMAL(10,2);

-- 2. Update subscription plans with correct pricing
UPDATE subscription_plans 
SET 
    "monthlyPrice" = CASE 
        WHEN id = 1 THEN 69.00    -- Basic Plan
        WHEN id = 2 THEN 350.00   -- Professional Plan  
        WHEN id = 3 THEN 399.00   -- Enterprise Plan
        ELSE 69.00
    END,
    "yearlyPrice" = CASE 
        WHEN id = 1 THEN 690.00   -- Basic Plan Annual (10 months price)
        WHEN id = 2 THEN 3360.00  -- Professional Plan Annual (9.6 months price)
        WHEN id = 3 THEN 3990.00  -- Enterprise Plan Annual (10 months price)
        ELSE 690.00
    END
WHERE id IN (1, 2, 3);

-- 3. Verify the updates worked correctly
SELECT 
    id, 
    name, 
    price as old_price_text,
    "monthlyPrice" as monthly_price,
    "yearlyPrice" as yearly_price,
    "trialDays"
FROM subscription_plans 
ORDER BY id;

-- 4. Check that Professional Plan now has correct yearly price
SELECT 
    name,
    "monthlyPrice",
    "yearlyPrice",
    ("yearlyPrice" / "monthlyPrice")::DECIMAL(4,1) as months_discount
FROM subscription_plans 
WHERE id = 2;