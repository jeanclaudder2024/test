-- Insert 15 Comprehensive Maritime Document Templates
-- Run this SQL in your Supabase database to add the templates

INSERT INTO document_templates (name, description, category, prompt, is_active, usage_count, created_by, created_at, updated_at) VALUES

-- Technical Templates
('Vessel Technical Specification Report', 'Comprehensive technical specifications and capabilities analysis', 'technical', 'Generate a detailed technical specification report for {vesselName}. Include complete vessel dimensions, engine specifications, propulsion systems, navigation equipment, cargo handling systems, tank configurations, and technical certifications. Provide performance characteristics, fuel consumption rates, and operational capabilities.', true, 12, 1, NOW(), NOW()),

('Classification Society Certificate', 'Official classification and safety compliance documentation', 'technical', 'Generate a classification society certificate for {vesselName}. Include class notation, survey dates, hull classification, machinery class, safety equipment certification, structural integrity assessment, and compliance with international maritime standards.', true, 8, 1, NOW(), NOW()),

('Port State Control Inspection Report', 'Comprehensive port state control inspection and compliance', 'technical', 'Generate a port state control inspection report for {vesselName}. Include inspection checklist, deficiency analysis, corrective actions, crew certification verification, safety equipment inspection, and compliance with SOLAS, MARPOL, and MLC conventions.', true, 6, 1, NOW(), NOW()),

-- Commercial Templates  
('Commercial Vessel Valuation', 'Market value assessment and commercial viability analysis', 'commercial', 'Generate a commercial vessel valuation report for {vesselName}. Include current market value, depreciation analysis, earning potential, charter rate comparisons, operational cost breakdown, and investment recommendations based on current maritime market conditions.', true, 15, 1, NOW(), NOW()),

('Charter Party Agreement Analysis', 'Charter terms and commercial agreement evaluation', 'commercial', 'Generate a charter party agreement analysis for {vesselName}. Include voyage charter terms, time charter considerations, freight rates, demurrage provisions, cargo requirements, port restrictions, and commercial risk assessment.', true, 7, 1, NOW(), NOW()),

-- Inspection Templates
('Annual Safety Inspection Report', 'Comprehensive annual safety and equipment inspection', 'inspection', 'Generate an annual safety inspection report for {vesselName}. Include fire safety systems, life-saving equipment, navigation aids, communication systems, structural integrity, and compliance with international safety standards.', true, 10, 1, NOW(), NOW()),

('Dry Dock Inspection Certificate', 'Complete dry dock maintenance and inspection documentation', 'inspection', 'Generate a dry dock inspection certificate for {vesselName}. Include hull inspection, underwater survey, propeller examination, sea valve inspection, tank inspections, coating assessments, and structural repairs completed during dry dock period.', true, 5, 1, NOW(), NOW()),

-- Cargo Templates
('Cargo Manifest and Documentation', 'Complete cargo documentation and manifest details', 'cargo', 'Generate comprehensive cargo manifest documentation for {vesselName}. Include bill of lading details, cargo specifications, loading procedures, tank allocation, cargo compatibility, safety procedures, and discharge instructions.', true, 18, 1, NOW(), NOW()),

-- Environmental Templates
('Environmental Compliance Report', 'Environmental regulations and emissions compliance', 'environmental', 'Generate an environmental compliance report for {vesselName}. Include emissions monitoring, ballast water management, waste disposal procedures, fuel sulfur content compliance, and adherence to MARPOL Annex VI regulations.', true, 9, 1, NOW(), NOW()),

-- Regulatory Templates
('ISM Code Compliance Audit', 'International Safety Management code compliance assessment', 'regulatory', 'Generate an ISM Code compliance audit for {vesselName}. Include safety management system evaluation, crew training records, emergency procedures, maintenance programs, non-conformity reports, and continuous improvement measures.', true, 11, 1, NOW(), NOW()),

-- Operations Templates  
('Voyage Planning and Execution Report', 'Comprehensive voyage planning and operational analysis', 'operations', 'Generate a voyage planning and execution report for {vesselName}. Include route optimization, weather routing, fuel planning, port rotation, cargo operations timeline, and operational efficiency metrics.', true, 14, 1, NOW(), NOW()),

-- Performance Templates
('Voyage Performance Analysis', 'Comprehensive voyage efficiency and performance metrics', 'performance', 'Generate a voyage performance analysis for {vesselName}. Include speed-consumption curves, weather routing analysis, fuel efficiency metrics, schedule adherence, port performance, and optimization recommendations.', true, 9, 1, NOW(), NOW()),

-- Insurance Templates
('Insurance & P&I Documentation', 'Marine insurance certificates and protection coverage', 'insurance', 'Generate insurance and P&I documentation for {vesselName}. Include hull and machinery coverage, cargo insurance, liability protection, crew coverage, war risks, pollution coverage, and claims history.', true, 4, 1, NOW(), NOW()),

-- Crew Templates
('Crew Certification Matrix', 'Complete crew qualifications and certification tracking', 'crew', 'Generate a crew certification matrix for {vesselName}. Include officer certificates, ratings qualifications, STCW compliance, medical certificates, training records, watchkeeping arrangements, and crew competency assessments.', true, 13, 1, NOW(), NOW()),

-- Safety Templates
('Emergency Response Plan', 'Comprehensive emergency procedures and response protocols', 'safety', 'Generate an emergency response plan for {vesselName}. Include fire emergency procedures, abandon ship protocols, man overboard response, collision procedures, grounding response, oil spill containment, and medical emergency protocols.', true, 16, 1, NOW(), NOW());

-- Verify insertion
SELECT COUNT(*) as total_templates FROM document_templates;
SELECT name, category FROM document_templates ORDER BY category, name;