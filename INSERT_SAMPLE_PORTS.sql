-- Manual Insert Query for Comprehensive Ports Data
-- Run this in your Supabase SQL Editor to add sample ports with all comprehensive fields

INSERT INTO ports (
    -- Basic Information
    name, country, region, city, timezone,
    
    -- Geographic Coordinates
    lat, lng,
    
    -- Port Classification
    type, status,
    
    -- Operational Information
    capacity, annual_throughput, operating_hours, description,
    
    -- Port Authority & Management
    port_authority, operator, owner,
    
    -- Contact Information
    email, phone, website, address, postal_code,
    
    -- Technical Specifications
    max_vessel_length, max_vessel_beam, max_draught, max_deadweight, berth_count, terminal_count,
    
    -- Water Depth & Navigation
    channel_depth, berth_depth, anchorage_depth,
    
    -- Services & Facilities (JSON arrays stored as TEXT)
    services, facilities, cargo_types,
    
    -- Safety & Security
    security_level, pilotage_required, tug_assistance, quarantine_station,
    
    -- Environmental & Regulatory
    environmental_certifications, customs_office, free_trade_zone,
    
    -- Infrastructure
    rail_connection, road_connection, airport_distance,
    
    -- Weather & Conditions
    average_wait_time, weather_restrictions, tidal_range,
    
    -- Economic Information
    port_charges, currency,
    
    -- Connectivity
    connected_refineries, nearby_ports,
    
    -- Statistics
    vessel_count, total_cargo,
    
    -- Metadata
    established, last_inspection, next_inspection, photo
) VALUES 
(
    -- Sample Port 1: Major Container Port
    'Port of Rotterdam', 'Netherlands', 'Europe', 'Rotterdam', 'Europe/Amsterdam',
    '51.9244', '4.4777',
    'container', 'operational',
    469000000, 470000000, '24/7', 'Europe''s largest port and gateway to European markets with state-of-the-art container handling facilities.',
    'Port of Rotterdam Authority', 'Rotterdam Port Services', 'Port of Rotterdam Authority',
    'info@portofrotterdam.com', '+31 10 252 1010', 'https://www.portofrotterdam.com', 'Wilhelminakade 909, 3072 AP Rotterdam', '3072 AP',
    400.00, 60.00, 23.00, 300000, 84, 12,
    23.00, 22.00, 20.00,
    '["pilotage", "tugboats", "bunker", "repair", "waste_disposal", "customs", "immigration"]',
    '["container_cranes", "warehouse", "cold_storage", "rail_terminal", "truck_terminal", "pipeline"]',
    '["container", "bulk", "oil", "gas", "general", "ro_ro"]',
    '1', true, true, true,
    '["ISO_14001", "OHSAS_18001", "Green_Award"]', true, true,
    true, true, 5.2,
    2.5, 'Strong westerly winds in winter months', 2.1,
    '{"port_dues": 0.45, "pilotage": 890, "tugboat": 1200, "berth": 15.50}', 'EUR',
    8, '["Port of Amsterdam", "Port of Hamburg", "Port of Antwerp"]',
    245, 850000.00,
    1872, '2024-06-15 10:30:00', '2024-12-15 09:00:00', 'https://example.com/rotterdam-port.jpg'
),
(
    -- Sample Port 2: Oil Terminal
    'Ras Tanura Terminal', 'Saudi Arabia', 'Middle East', 'Ras Tanura', 'Asia/Riyadh',
    '26.6855', '50.1647',
    'oil_terminal', 'operational',
    500000, 180000000, '24/7', 'World''s largest oil shipping port with extensive crude oil storage and loading facilities.',
    'Saudi Aramco', 'Saudi Aramco Marine', 'Saudi Aramco',
    'marine@aramco.com', '+966 13 876 0000', 'https://www.aramco.com', 'Ras Tanura Industrial Area', '31311',
    380.00, 70.00, 25.00, 500000, 28, 6,
    25.00, 24.00, 22.00,
    '["pilotage", "tugboats", "bunker", "fire_fighting", "oil_spill_response"]',
    '["oil_storage", "loading_arms", "pipeline", "vapor_recovery", "ballast_treatment"]',
    '["crude_oil", "refined_products", "petrochemicals"]',
    '2', true, true, true,
    '["ISO_14001", "ISPS_certified", "Oil_Spill_Response"]', true, false,
    false, true, 15.8,
    1.8, 'Shamal winds from northwest, sandstorms possible', 0.8,
    '{"port_dues": 0.35, "pilotage": 1200, "tugboat": 1500, "berth": 25.00}', 'SAR',
    3, '["Jubail Port", "Dammam Port"]',
    45, 2800000.00,
    1939, '2024-05-20 14:00:00', '2024-11-20 08:00:00', 'https://example.com/ras-tanura.jpg'
),
(
    -- Sample Port 3: Bulk Cargo Port
    'Port of Newcastle', 'Australia', 'Asia-Pacific', 'Newcastle', 'Australia/Sydney',
    '-32.9283', '151.7817',
    'bulk', 'operational',
    165000000, 170000000, '24/7', 'Major coal export port serving Australia''s Hunter Valley with modern bulk handling facilities.',
    'Port of Newcastle', 'Port of Newcastle Operations', 'Government of New South Wales',
    'enquiries@portofnewcastle.com.au', '+61 2 4908 8200', 'https://www.portofnewcastle.com.au', '2 Honeysuckle Drive, Newcastle NSW', '2300',
    300.00, 50.00, 18.50, 250000, 16, 4,
    18.50, 17.50, 16.00,
    '["pilotage", "tugboats", "bunker", "ship_chandler", "crew_change"]',
    '["conveyor_systems", "stockyards", "rail_loop", "ship_loaders", "dust_suppression"]',
    '["coal", "grain", "alumina", "general"]',
    '1', true, true, false,
    '["ISO_14001", "Green_Marine"]', true, false,
    true, true, 8.5,
    12.0, 'Seasonal strong easterly winds', 1.4,
    '{"port_dues": 0.55, "pilotage": 750, "tugboat": 950, "berth": 18.00}', 'AUD',
    2, '["Port Kembla", "Port of Sydney"]',
    78, 450000.00,
    1804, '2024-07-10 11:15:00', '2025-01-10 10:00:00', 'https://example.com/newcastle-port.jpg'
),
(
    -- Sample Port 4: Multi-Purpose Port
    'Port of Hamburg', 'Germany', 'Europe', 'Hamburg', 'Europe/Berlin',
    '53.5511', '9.9937',
    'commercial', 'operational',
    130000000, 136000000, '24/7', 'Gateway to Northern Europe with comprehensive cargo handling capabilities and excellent hinterland connections.',
    'Hamburg Port Authority', 'HHLA Container Terminals', 'Free and Hanseatic City of Hamburg',
    'info@hpa.hamburg.de', '+49 40 42847 0', 'https://www.hamburg-port.com', 'Neuer Wandrahm 4, 20457 Hamburg', '20457',
    350.00, 55.00, 15.10, 200000, 67, 9,
    15.10, 14.50, 13.80,
    '["pilotage", "tugboats", "bunker", "repair", "waste_disposal", "icebreaker"]',
    '["container_terminal", "warehouse", "cold_storage", "rail_terminal", "barge_terminal"]',
    '["container", "general", "bulk", "ro_ro", "cruise"]',
    '1', true, true, true,
    '["ISO_14001", "EMAS", "Blue_Angel"]', true, true,
    true, true, 12.3,
    8.5, 'Ice formation in winter, tidal restrictions', 3.4,
    '{"port_dues": 0.48, "pilotage": 680, "tugboat": 850, "berth": 12.80}', 'EUR',
    5, '["Port of Bremen", "Port of Rotterdam", "Port of Antwerp"]',
    189, 720000.00,
    1189, '2024-06-01 09:45:00', '2024-12-01 08:30:00', 'https://example.com/hamburg-port.jpg'
),
(
    -- Sample Port 5: Fishing and Commercial Port
    'Port of Vigo', 'Spain', 'Europe', 'Vigo', 'Europe/Madrid',
    '42.2406', '-8.7207',
    'fishing', 'operational',
    2500000, 3200000, '06:00-22:00', 'Major fishing port with modern fish processing facilities and commercial cargo operations.',
    'Port Authority of Vigo', 'Autoridad Portuaria de Vigo', 'Spanish Port System',
    'info@apvigo.es', '+34 986 268 000', 'https://www.apvigo.es', 'Avenida del Puerto s/n, 36202 Vigo', '36202',
    180.00, 28.00, 12.00, 35000, 32, 8,
    12.00, 11.50, 10.00,
    '["pilotage", "tugboats", "bunker", "fish_market", "ice_supply"]',
    '["fish_processing", "cold_storage", "container_terminal", "ro_ro_terminal", "cruise_terminal"]',
    '["fish", "seafood", "container", "ro_ro", "general"]',
    '1', false, true, true,
    '["ISO_14001", "Blue_Flag"]', true, false,
    true, true, 25.8,
    4.5, 'Atlantic storms in winter', 3.8,
    '{"port_dues": 0.52, "pilotage": 450, "tugboat": 550, "berth": 8.50}', 'EUR',
    1, '["Port of A Coruña", "Port of Ferrol"]',
    156, 125000.00,
    1886, '2024-05-15 07:30:00', '2024-11-15 07:00:00', 'https://example.com/vigo-port.jpg'
);

-- Verify the inserted data
SELECT 'Sample ports data inserted successfully. Checking results...' AS status;

-- Show the inserted ports with key information
SELECT 
    name, 
    country, 
    type, 
    status,
    capacity,
    berth_count,
    vessel_count,
    established
FROM ports 
WHERE name IN ('Port of Rotterdam', 'Ras Tanura Terminal', 'Port of Newcastle', 'Port of Hamburg', 'Port of Vigo')
ORDER BY name;