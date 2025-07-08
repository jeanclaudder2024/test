-- Fix document templates category constraint to allow all required categories
-- This addresses the error: new row for relation "document_templates" violates check constraint "document_templates_category_check"

-- Drop the existing constraint if it exists
ALTER TABLE document_templates DROP CONSTRAINT IF EXISTS document_templates_category_check;

-- Add the new constraint that allows all categories used by the frontend
ALTER TABLE document_templates ADD CONSTRAINT document_templates_category_check 
CHECK (category IN ('technical', 'commercial', 'inspection', 'cargo', 'compliance', 'general', 'safety', 'environmental', 'crew', 'insurance'));

-- Update any existing templates that might have invalid categories to 'general'
UPDATE document_templates 
SET category = 'general' 
WHERE category NOT IN ('technical', 'commercial', 'inspection', 'cargo', 'compliance', 'general', 'safety', 'environmental', 'crew', 'insurance');

-- Verify the constraint is working
SELECT DISTINCT category FROM document_templates ORDER BY category;