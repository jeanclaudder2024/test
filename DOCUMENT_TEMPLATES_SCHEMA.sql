-- Professional Article Templates Schema
-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS generated_articles CASCADE;
DROP TABLE IF EXISTS article_templates CASCADE;

-- Create article templates table
CREATE TABLE article_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'commercial', 'inspection', 'cargo', 'compliance')),
  prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create generated articles table to track articles created from templates
CREATE TABLE generated_articles (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES article_templates(id) ON DELETE CASCADE,
  vessel_id INTEGER NOT NULL,
  vessel_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'published', 'archived')),
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_article_templates_category ON article_templates(category);
CREATE INDEX idx_article_templates_active ON article_templates(is_active);
CREATE INDEX idx_article_templates_created_by ON article_templates(created_by);
CREATE INDEX idx_generated_articles_template_id ON generated_articles(template_id);
CREATE INDEX idx_generated_articles_vessel_id ON generated_articles(vessel_id);
CREATE INDEX idx_generated_articles_created_by ON generated_articles(created_by);

-- Insert some default article templates
INSERT INTO article_templates (title, description, category, prompt, is_active, usage_count, created_by) VALUES
('Technical Safety Certificate', 'Comprehensive technical specifications and safety compliance documentation', 'technical', 'Generate a professional technical safety certificate for the vessel {vesselName}. Include the following sections: 1. Vessel Technical Specifications, 2. Safety Equipment and Systems, 3. Compliance Certifications, 4. Inspection Records, 5. Operational Guidelines. Write in formal maritime technical language with specific details about safety protocols, equipment specifications, and regulatory compliance. Format as structured HTML suitable for official maritime documentation.', true, 0, 1),
('Commercial Viability Analysis', 'Detailed commercial analysis and market assessment report', 'commercial', 'Generate a comprehensive commercial viability analysis for the vessel {vesselName}. Include the following sections: 1. Market Analysis and Positioning, 2. Financial Performance Metrics, 3. Operational Efficiency Assessment, 4. Risk Analysis and Mitigation, 5. Investment Recommendations. Write in professional business language with quantitative analysis, market insights, and strategic recommendations. Format as structured HTML suitable for executive decision-making.', true, 0, 1),
('Vessel Inspection Report', 'Detailed inspection findings and compliance assessment', 'inspection', 'Generate a comprehensive vessel inspection report for {vesselName}. Include the following sections: 1. Hull and Structural Integrity, 2. Cargo Systems and Equipment, 3. Navigation and Communication Systems, 4. Safety Equipment and Procedures, 5. Environmental Compliance, 6. Crew Facilities and Standards, 7. Maintenance Status, 8. Recommendations and Action Items. Write in professional maritime inspection language with specific findings, recommendations, and compliance status. Format as structured HTML with clear sections.', true, 0, 1),
('Cargo Manifest Document', 'Official cargo documentation and handling specifications', 'cargo', 'Generate a comprehensive cargo manifest document for the vessel {vesselName}. Include the following sections: 1. Cargo Description and Classification, 2. Loading and Stowage Details, 3. Quantity and Weight Specifications, 4. Origin and Destination Information, 5. Handling Requirements, 6. Safety and Environmental Considerations, 7. Documentation and Certificates, 8. Compliance with International Regulations. Write in formal maritime documentation language with precise technical details. Format as structured HTML suitable for official cargo documentation.', true, 0, 1),
('Environmental Compliance Certificate', 'Environmental impact assessment and compliance documentation', 'compliance', 'Generate a comprehensive environmental compliance certificate for the vessel {vesselName}. Include the following sections: 1. Environmental Impact Assessment, 2. Emission Control Systems, 3. Waste Management Procedures, 4. Ballast Water Management, 5. Oil Pollution Prevention, 6. International Environmental Compliance, 7. Environmental Management Systems, 8. Monitoring and Reporting. Write in formal environmental regulatory language with specific compliance details. Format as structured HTML suitable for regulatory submission.', true, 0, 1);

-- Update trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_article_templates_updated_at BEFORE UPDATE ON article_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_articles_updated_at BEFORE UPDATE ON generated_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to increment usage count when article is generated
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE article_templates 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_usage_on_generation AFTER INSERT ON generated_articles FOR EACH ROW EXECUTE FUNCTION increment_template_usage();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON article_templates TO your_database_user;
-- GRANT ALL PRIVILEGES ON generated_articles TO your_database_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_database_user;