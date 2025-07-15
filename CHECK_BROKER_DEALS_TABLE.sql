-- Check if broker_deals table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'broker_deals' 
ORDER BY ordinal_position;

-- If the table doesn't exist or is missing columns, run the following: