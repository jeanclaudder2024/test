-- Fix missing is_active column in admin_documents table
-- Run this SQL script in your Supabase SQL Editor

-- Add the missing is_active column
ALTER TABLE admin_documents 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records to have is_active = true
UPDATE admin_documents 
SET is_active = true 
WHERE is_active IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_documents_is_active ON admin_documents(is_active);

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'admin_documents' 
AND column_name = 'is_active';