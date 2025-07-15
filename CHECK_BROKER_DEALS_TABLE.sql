-- COMPLETE DATABASE VERIFICATION FOR BROKER DEALS TABLE
-- This script will show you exactly what columns exist in the broker_deals table

-- 1. Show all columns in broker_deals table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'broker_deals' 
ORDER BY ordinal_position;

-- 2. Show table constraints
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'broker_deals';

-- 3. Check if specific columns exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'broker_deals' AND column_name = 'current_step'
    ) THEN '✓ current_step exists' 
    ELSE '✗ current_step missing' END as current_step_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'broker_deals' AND column_name = 'transaction_type'
    ) THEN '✓ transaction_type exists' 
    ELSE '✗ transaction_type missing' END as transaction_type_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'broker_deals' AND column_name = 'overall_progress'
    ) THEN '✓ overall_progress exists' 
    ELSE '✗ overall_progress missing' END as overall_progress_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'broker_deals' AND column_name = 'buyer_company'
    ) THEN '✓ buyer_company exists' 
    ELSE '✗ buyer_company missing' END as buyer_company_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'broker_deals' AND column_name = 'seller_company'
    ) THEN '✓ seller_company exists' 
    ELSE '✗ seller_company missing' END as seller_company_status;

-- 4. Count total columns
SELECT COUNT(*) as total_columns_in_broker_deals
FROM information_schema.columns 
WHERE table_name = 'broker_deals';

-- 5. Show sample data (if any exists)
SELECT COUNT(*) as total_deals FROM broker_deals;

-- 6. Test INSERT to see what columns are actually expected
-- (This will show an error if columns are still missing)
EXPLAIN (FORMAT TEXT) 
INSERT INTO broker_deals (
    title, description, status, deal_type, quantity, price, origin, destination, 
    user_id, vessel_id, current_step, transaction_type, overall_progress,
    buyer_company, seller_company, contract_value, commission_rate,
    transaction_status, priority_level
) VALUES (
    'Test Deal', 'Test Description', 'pending', 'CIF-ASWP', '50000', 75.50, 
    'Saudi Arabia', 'Rotterdam', 1, 1, 1, 'CIF-ASWP', 0,
    'Test Buyer', 'Test Seller', 1000000.00, 2.00,
    'pending', 'medium'
);