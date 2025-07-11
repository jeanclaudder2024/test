-- Complete fix for landing page content table structure
-- This matches the Drizzle schema exactly

DROP TABLE IF EXISTS landing_page_content CASCADE;

CREATE TABLE landing_page_content (
  id SERIAL PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  content JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample landing page content
INSERT INTO landing_page_content (section, title, subtitle, description, button_text, button_link, is_active, display_order) VALUES
('hero', 'PetroDealHub - Maritime Oil Trading Platform', 'Connect. Trade. Succeed in Global Energy Markets', 'The world''s leading maritime oil brokerage platform connecting buyers and sellers worldwide with real-time vessel tracking, secure transactions, and professional maritime documentation.', 'Start Free Trial', '/register', true, 1),
('features', 'Comprehensive Maritime Trading Solutions', NULL, 'Advanced platform features designed for professional oil trading and maritime logistics management with real-time vessel tracking and secure transaction processing.', NULL, NULL, true, 2),
('stats', 'Trusted by Industry Leaders', NULL, 'Join thousands of professionals using PetroDealHub for maritime oil trading worldwide with access to global markets and professional documentation services.', NULL, NULL, true, 3),
('pricing', 'Choose Your Trading Plan', NULL, 'Professional subscription plans designed for every level of maritime oil trading business with comprehensive features and support.', 'View All Plans', '/pricing', true, 4),
('contact', 'Ready to Start Trading?', NULL, 'Join our platform today and connect with maritime oil trading opportunities worldwide. Get started with your free trial now.', 'Get Started Now', '/register', true, 5);