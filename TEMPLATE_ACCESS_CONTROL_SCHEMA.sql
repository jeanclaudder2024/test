-- Add access control columns to document_templates table
-- This enables role-based permissions for template generation

-- Add access control columns
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS broker_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS basic_access BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS professional_access BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enterprise_access BOOLEAN DEFAULT true;

-- Add comments for clarity
COMMENT ON COLUMN document_templates.admin_only IS 'Only admin users can generate documents from this template';
COMMENT ON COLUMN document_templates.broker_only IS 'Only broker+ subscription plans can generate documents';
COMMENT ON COLUMN document_templates.basic_access IS 'Basic plan subscribers can generate documents';
COMMENT ON COLUMN document_templates.professional_access IS 'Professional plan subscribers can generate documents';
COMMENT ON COLUMN document_templates.enterprise_access IS 'Enterprise plan subscribers can generate documents';

-- Update existing templates to have default access (all plans can access)
UPDATE document_templates 
SET 
  admin_only = false,
  broker_only = false,
  basic_access = true,
  professional_access = true,
  enterprise_access = true
WHERE admin_only IS NULL OR broker_only IS NULL;