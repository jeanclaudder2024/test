-- Manual Port Addition to Database
-- Replace the values below with your actual port data

INSERT INTO ports (
  name, country, region, city, lat, lng, timezone,
  type, status, classification, capacity, annual_throughput,
  max_vessel_length, max_vessel_beam, max_draught, channel_depth,
  berth_count, total_berth_length, port_authority, operator,
  operating_hours, pilotage_required, tug_assistance,
  rail_connections, road_connections, airport_distance,
  warehouse_area, storage_capacity, security_level,
  customs_facilities, quarantine_facilities, safety_record,
  available_services, cargo_types, currency, average_handling_cost,
  address, email, phone, website, description
) VALUES (
  'Your Port Name',           -- name
  'Country Name',             -- country  
  'Region Name',              -- region
  'City Name',                -- city
  '00.000000',               -- latitude
  '00.000000',               -- longitude
  'UTC+0',                   -- timezone
  'Commercial',              -- type
  'Operational',             -- status
  'International',           -- classification
  500000,                    -- capacity (tons)
  2000000,                   -- annual_throughput (tons)
  '350m',                    -- max_vessel_length
  '50m',                     -- max_vessel_beam
  '18m',                     -- max_draught
  '20m',                     -- channel_depth
  12,                        -- berth_count
  '2400m',                   -- total_berth_length
  'Port Authority Name',      -- port_authority
  'Port Operator Name',       -- operator
  '24/7',                    -- operating_hours
  true,                      -- pilotage_required
  true,                      -- tug_assistance
  true,                      -- rail_connections
  true,                      -- road_connections
  '15km',                    -- airport_distance
  '50000 sqm',               -- warehouse_area
  '1000000 tons',            -- storage_capacity
  'ISPS Level 1',            -- security_level
  true,                      -- customs_facilities
  false,                     -- quarantine_facilities
  'Excellent',               -- safety_record
  'Cargo handling, Storage, Customs', -- available_services
  'Oil, Gas, Containers',    -- cargo_types
  'USD',                     -- currency
  '$50/ton',                 -- average_handling_cost
  'Port Address',            -- address
  'contact@port.com',        -- email
  '+1-234-567-8900',         -- phone
  'https://www.port.com',    -- website
  'Port description here'     -- description
);