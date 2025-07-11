-- ===============================================
-- BROKER CHECKBOX DATABASE VERIFICATION & SETUP
-- ===============================================
-- This file checks and ensures all broker member functionality is properly set up

-- 1. CHECK CURRENT TABLE STRUCTURE
SELECT 'CURRENT DOCUMENT_TEMPLATES TABLE STRUCTURE:' as status;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'document_templates' 
ORDER BY ordinal_position;

-- 2. ENSURE ACCESS CONTROL COLUMNS EXIST
SELECT 'ADDING ACCESS CONTROL COLUMNS IF MISSING:' as status;

-- Add broker_only column if it doesn't exist
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS broker_only BOOLEAN DEFAULT FALSE;

-- Add other access control columns if they don't exist
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT FALSE;

ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS basic_access BOOLEAN DEFAULT TRUE;

ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS professional_access BOOLEAN DEFAULT TRUE;

ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS enterprise_access BOOLEAN DEFAULT TRUE;

-- 3. VERIFY ALL ACCESS CONTROL COLUMNS EXIST
SELECT 'ACCESS CONTROL COLUMNS VERIFICATION:' as status;
SELECT 
  column_name,
  data_type,
  CASE WHEN column_name IN ('admin_only', 'broker_only', 'basic_access', 'professional_access', 'enterprise_access') 
       THEN '✓ ACCESS CONTROL COLUMN' 
       ELSE 'regular column' 
  END as column_type
FROM information_schema.columns 
WHERE table_name = 'document_templates' 
AND column_name IN ('admin_only', 'broker_only', 'basic_access', 'professional_access', 'enterprise_access')
ORDER BY column_name;

-- 4. CHECK EXISTING TEMPLATES AND THEIR ACCESS SETTINGS
SELECT 'EXISTING TEMPLATES WITH ACCESS CONTROL:' as status;
SELECT 
  id,
  name,
  COALESCE(admin_only, FALSE) as admin_only,
  COALESCE(broker_only, FALSE) as broker_only,
  COALESCE(basic_access, TRUE) as basic_access,
  COALESCE(professional_access, TRUE) as professional_access,
  COALESCE(enterprise_access, TRUE) as enterprise_access,
  is_active
FROM document_templates 
ORDER BY id;

-- 5. CREATE A TEST TEMPLATE WITH BROKER ACCESS
SELECT 'CREATING TEST BROKER TEMPLATE:' as status;
INSERT INTO document_templates (
  name, 
  description, 
  category, 
  prompt, 
  is_active,
  admin_only,
  broker_only,
  basic_access,
  professional_access,
  enterprise_access,
  created_by
) VALUES (
  'Broker Test Template',
  'Test template for broker member access verification',
  'technical',
  'Generate a test document for broker verification purposes',
  TRUE,
  FALSE,  -- admin_only
  TRUE,   -- broker_only (THIS IS THE KEY FIELD)
  FALSE,  -- basic_access
  FALSE,  -- professional_access
  FALSE,  -- enterprise_access
  1       -- created_by (admin user)
) ON CONFLICT DO NOTHING;

-- 6. VERIFY THE TEST TEMPLATE WAS CREATED
SELECT 'BROKER TEST TEMPLATE VERIFICATION:' as status;
SELECT 
  id,
  name,
  broker_only,
  admin_only,
  basic_access,
  professional_access,
  enterprise_access
FROM document_templates 
WHERE name = 'Broker Test Template';

-- 7. FINAL STATUS CHECK
SELECT 'FINAL DATABASE STATUS:' as status;
SELECT 
  COUNT(*) as total_templates,
  COUNT(CASE WHEN broker_only = TRUE THEN 1 END) as broker_only_templates,
  COUNT(CASE WHEN admin_only = TRUE THEN 1 END) as admin_only_templates,
  COUNT(CASE WHEN basic_access = TRUE THEN 1 END) as basic_access_templates,
  COUNT(CASE WHEN professional_access = TRUE THEN 1 END) as professional_access_templates,
  COUNT(CASE WHEN enterprise_access = TRUE THEN 1 END) as enterprise_access_templates
FROM document_templates;

-- 8. SHOW SUCCESS MESSAGE
SELECT '✅ BROKER CHECKBOX DATABASE SETUP COMPLETE!' as status,
       'The broker_only column exists and is ready for use' as message,
       'Admin panel should now show the Broker Members checkbox' as next_step;