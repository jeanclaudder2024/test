-- Add missing current_step column to broker_deals table
ALTER TABLE broker_deals 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 8);

-- Add comment for clarity
COMMENT ON COLUMN broker_deals.current_step IS 'Current step in the 8-step CIF-ASWP transaction process (1-8)';

-- Update existing deals to have current_step = 1
UPDATE broker_deals 
SET current_step = 1 
WHERE current_step IS NULL;