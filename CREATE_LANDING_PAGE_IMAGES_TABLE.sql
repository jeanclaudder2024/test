-- Create landing_page_images table with correct structure
DROP TABLE IF EXISTS landing_page_images CASCADE;

CREATE TABLE landing_page_images (
  id SERIAL PRIMARY KEY,
  section TEXT NOT NULL,
  image_key VARCHAR(100) NOT NULL,
  image_url TEXT,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section, image_key)
);

-- Insert some sample images for testing
INSERT INTO landing_page_images (section, image_key, image_url, alt_text, display_order, is_active) VALUES
('hero', 'hero-background', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070', 'Maritime oil tanker at sea', 1, true),
('industry', 'oil-refinery', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=2125', 'Modern oil refinery facility', 1, true),
('features', 'vessel-tracking', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070', 'Vessel tracking technology', 1, true),
('how-it-works', 'platform-workflow', 'https://images.unsplash.com/photo-1586864387789-628af9feed72?q=80&w=2070', 'Digital platform workflow', 1, true);

-- Verify the table structure
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'landing_page_images' 
ORDER BY ordinal_position;