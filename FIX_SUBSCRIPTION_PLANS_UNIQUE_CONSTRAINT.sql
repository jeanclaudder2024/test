-- Fix for PostgreSQL error: "42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- This adds the missing unique constraint on the name column in subscription_plans table

-- First, check if the constraint already exists (to make this script idempotent)
DO $$
BEGIN
    -- Add unique constraint on name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'subscription_plans_name_unique'
        AND conrelid = 'subscription_plans'::regclass
    ) THEN
        ALTER TABLE subscription_plans
        ADD CONSTRAINT subscription_plans_name_unique UNIQUE (name);
        
        RAISE NOTICE 'Added unique constraint on subscription_plans.name';
    ELSE
        RAISE NOTICE 'Unique constraint on subscription_plans.name already exists';
    END IF;
END
$$;

-- Now the ON CONFLICT (name) clause in CHECK_AND_FIX_SUBSCRIPTION_TABLES.sql will work properly