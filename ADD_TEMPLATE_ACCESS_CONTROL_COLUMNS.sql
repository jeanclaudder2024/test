-- Add access control columns to document_templates table
-- This script adds the new columns needed for template access control

-- Add access control columns
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS broker_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS basic_access BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS professional_access BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enterprise_access BOOLEAN DEFAULT true;

-- Add index for performance on access control queries
CREATE INDEX IF NOT EXISTS idx_document_templates_access_control 
ON document_templates (admin_only, broker_only, basic_access, professional_access, enterprise_access);

-- Update existing templates to have default access settings
UPDATE document_templates 
SET 
  admin_only = false,
  broker_only = false,
  basic_access = true,
  professional_access = true,
  enterprise_access = true
WHERE admin_only IS NULL OR broker_only IS NULL;

SELECT 'Template access control columns added successfully' AS result;