-- Landing Page Content Management Tables
-- Execute these SQL statements manually in your database

-- 1. Create landing_page_sections table for managing sections
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id SERIAL PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  section_name VARCHAR(255) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create landing_page_content table for text content
CREATE TABLE IF NOT EXISTS landing_page_content (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES landing_page_sections(id) ON DELETE CASCADE,
  content_key VARCHAR(100) NOT NULL,
  content_type VARCHAR(50) DEFAULT 'text', -- text, html, image_url, json
  content_value TEXT,
  placeholder_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section_id, content_key)
);

-- 3. Create landing_page_images table for image management
CREATE TABLE IF NOT EXISTS landing_page_images (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES landing_page_sections(id) ON DELETE CASCADE,
  image_key VARCHAR(100) NOT NULL,
  image_url TEXT,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section_id, image_key)
);

-- 4. Create landing_page_blocks table for repeatable content
CREATE TABLE IF NOT EXISTS landing_page_blocks (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES landing_page_sections(id) ON DELETE CASCADE,
  block_type VARCHAR(100) NOT NULL, -- service_card, subscription_card, gallery_item, etc.
  title VARCHAR(255),
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text VARCHAR(100),
  metadata JSONB, -- for additional flexible data
  display_order INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default sections
INSERT INTO landing_page_sections (section_key, section_name, is_enabled, display_order) VALUES
('hero', 'Hero Section', true, 1),
('services', 'Services Section', true, 2),
('features', 'Features Section', true, 3),
('gallery', 'Gallery Section', true, 4),
('subscriptions', 'Subscription Plans', true, 5),
('footer', 'Footer Section', true, 6)
ON CONFLICT (section_key) DO NOTHING;

-- Insert default hero content
INSERT INTO landing_page_content (section_id, content_key, content_type, content_value, placeholder_text) VALUES
((SELECT id FROM landing_page_sections WHERE section_key = 'hero'), 'title', 'text', 'Navigate Global Energy Markets with Confidence', 'Main hero title'),
((SELECT id FROM landing_page_sections WHERE section_key = 'hero'), 'subtitle', 'text', 'Advanced maritime intelligence platform for oil vessel tracking, market analysis, and strategic decision-making in the global energy sector.', 'Hero subtitle description'),
((SELECT id FROM landing_page_sections WHERE section_key = 'hero'), 'primary_button', 'text', 'Start Free Trial', 'Primary button text'),
((SELECT id FROM landing_page_sections WHERE section_key = 'hero'), 'secondary_button', 'text', 'View Pricing', 'Secondary button text')
ON CONFLICT (section_id, content_key) DO NOTHING;

-- Insert default services content
INSERT INTO landing_page_content (section_id, content_key, content_type, content_value, placeholder_text) VALUES
((SELECT id FROM landing_page_sections WHERE section_key = 'services'), 'title', 'text', 'Comprehensive Maritime Intelligence', 'Services section title'),
((SELECT id FROM landing_page_sections WHERE section_key = 'services'), 'subtitle', 'text', 'Everything you need to track, analyze, and optimize your maritime operations', 'Services section subtitle')
ON CONFLICT (section_id, content_key) DO NOTHING;

-- Insert default subscription content
INSERT INTO landing_page_content (section_id, content_key, content_type, content_value, placeholder_text) VALUES
((SELECT id FROM landing_page_sections WHERE section_key = 'subscriptions'), 'title', 'text', 'Choose Your Plan', 'Subscription section title'),
((SELECT id FROM landing_page_sections WHERE section_key = 'subscriptions'), 'subtitle', 'text', 'Flexible pricing options to meet your business needs', 'Subscription section subtitle')
ON CONFLICT (section_id, content_key) DO NOTHING;

-- Insert default footer content
INSERT INTO landing_page_content (section_id, content_key, content_type, content_value, placeholder_text) VALUES
((SELECT id FROM landing_page_sections WHERE section_key = 'footer'), 'company_name', 'text', 'PetroDealHub', 'Company name'),
((SELECT id FROM landing_page_sections WHERE section_key = 'footer'), 'company_description', 'text', 'Leading maritime intelligence platform for the global energy sector', 'Company description'),
((SELECT id FROM landing_page_sections WHERE section_key = 'footer'), 'copyright_text', 'text', '© 2024 PetroDealHub. All rights reserved.', 'Copyright text')
ON CONFLICT (section_id, content_key) DO NOTHING;

-- Insert default service blocks
INSERT INTO landing_page_blocks (section_id, block_type, title, description, display_order, is_enabled) VALUES
((SELECT id FROM landing_page_sections WHERE section_key = 'services'), 'service_card', 'Real-Time Vessel Tracking', 'Monitor oil tankers and cargo vessels worldwide with live position updates and route optimization.', 1, true),
((SELECT id FROM landing_page_sections WHERE section_key = 'services'), 'service_card', 'Market Intelligence', 'Access comprehensive market data, pricing trends, and trading opportunities in the global oil market.', 2, true),
((SELECT id FROM landing_page_sections WHERE section_key = 'services'), 'service_card', 'Route Optimization', 'Optimize shipping routes for cost efficiency and time savings with advanced analytics.', 3, true),
((SELECT id FROM landing_page_sections WHERE section_key = 'services'), 'service_card', 'Risk Assessment', 'Evaluate maritime risks, weather conditions, and geopolitical factors affecting your operations.', 4, true)
ON CONFLICT DO NOTHING;

-- Insert default images
INSERT INTO landing_page_images (section_id, image_key, image_url, alt_text, display_order) VALUES
((SELECT id FROM landing_page_sections WHERE section_key = 'hero'), 'background', '/images/hero-bg.jpg', 'Maritime operations background', 1),
((SELECT id FROM landing_page_sections WHERE section_key = 'gallery'), 'gallery_1', '/images/gallery-1.jpg', 'Oil tanker at sea', 1),
((SELECT id FROM landing_page_sections WHERE section_key = 'gallery'), 'gallery_2', '/images/gallery-2.jpg', 'Port operations', 2),
((SELECT id FROM landing_page_sections WHERE section_key = 'gallery'), 'gallery_3', '/images/gallery-3.jpg', 'Maritime control room', 3)
ON CONFLICT (section_id, image_key) DO NOTHING;

-- Create missing vessel_documents table (fixing the error)
CREATE TABLE IF NOT EXISTS vessel_documents (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vessel_id, document_id)
);

-- Create professional_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS professional_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'published',
  created_by INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  pdf_path VARCHAR(500)
);