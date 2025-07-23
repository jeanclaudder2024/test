-- Database Verification Queries for Subscription System
-- Please run these queries manually to check the database structure

-- 1. Check subscription_plans table structure and data
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
ORDER BY ordinal_position;

-- 2. Check current subscription plans data with pricing
SELECT 
    id, 
    name, 
    price as monthly_price_text,
    "monthlyPrice" as monthly_price_numeric,
    "yearlyPrice" as yearly_price_numeric,
    "trialDays",
    interval_type,
    status
FROM subscription_plans 
ORDER BY id;

-- 3. Check user_subscriptions table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions' 
ORDER BY ordinal_position;

-- 4. Check current user subscriptions
SELECT 
    id,
    "userId",
    "planId", 
    status,
    "currentPeriodStart",
    "currentPeriodEnd",
    "trialStartDate",
    "trialEndDate"
FROM user_subscriptions 
ORDER BY id DESC
LIMIT 10;

-- 5. Check if the subscription_plans table has the required pricing columns
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'monthlyPrice') 
        THEN 'monthlyPrice column EXISTS' 
        ELSE 'monthlyPrice column MISSING' 
    END as monthly_price_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'yearlyPrice') 
        THEN 'yearlyPrice column EXISTS' 
        ELSE 'yearlyPrice column MISSING' 
    END as yearly_price_check;

-- 6. Check users table for stripe-related columns
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE '%stripe%'
ORDER BY column_name;

-- 7. Check if we need to add missing columns to subscription_plans
-- Run this if the pricing columns are missing:
/*
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS "monthlyPrice" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "yearlyPrice" DECIMAL(10,2);
*/

-- 8. Update subscription plans with correct pricing if needed:
/*
UPDATE subscription_plans 
SET 
    "monthlyPrice" = CASE 
        WHEN id = 1 THEN 69.00
        WHEN id = 2 THEN 350.00  
        WHEN id = 3 THEN 399.00
        ELSE "monthlyPrice"
    END,
    "yearlyPrice" = CASE 
        WHEN id = 1 THEN 690.00
        WHEN id = 2 THEN 3360.00
        WHEN id = 3 THEN 3990.00
        ELSE "yearlyPrice"
    END
WHERE id IN (1, 2, 3);
*/