-- Manual Port Addition to Database
-- Replace the values below with your actual port data

INSERT INTO ports (
  name, country, region, city, lat, lng, timezone,
  type, status, capacity, "annualThroughput",
  "maxVesselLength", "maxVesselBeam", "maxDraught", "channelDepth",
  "berthCount", "totalBerthLength", "portAuthority", operator,
  "operatingHours", "pilotageRequired", "tugAssistance",
  "railConnections", "roadConnections", "airportDistance",
  "warehouseArea", "storageCapacity", "securityLevel",
  "customsFacilities", "quarantineFacilities", "safetyRecord",
  "availableServices", "cargoTypes", currency, "averageHandlingCost",
  address, email, phone, website, description
) VALUES (
  'Your Port Name',           -- name
  'Country Name',             -- country  
  'Region Name',              -- region
  'City Name',                -- city
  00.000000,                  -- latitude (decimal number)
  00.000000,                  -- longitude (decimal number)
  'UTC+0',                    -- timezone
  'commercial',               -- type
  'operational',              -- status
  500000,                     -- capacity (tons)
  2000000,                    -- annual_throughput (tons)
  350.0,                      -- max_vessel_length (meters)
  50.0,                       -- max_vessel_beam (meters)
  18.0,                       -- max_draught (meters)
  20.0,                       -- channel_depth (meters)
  12,                         -- berth_count
  2400.0,                     -- total_berth_length (meters)
  'Port Authority Name',      -- port_authority
  'Port Operator Name',       -- operator
  '24/7',                     -- operating_hours
  true,                       -- pilotage_required
  true,                       -- tug_assistance
  true,                       -- rail_connections
  true,                       -- road_connections
  15.0,                       -- airport_distance (km)
  50000.0,                    -- warehouse_area (sqm)
  1000000.0,                  -- storage_capacity (tons)
  'ISPS Level 1',             -- security_level
  true,                       -- customs_facilities
  false,                      -- quarantine_facilities
  'Excellent',                -- safety_record
  'Cargo handling, Storage, Customs', -- available_services
  'Oil, Gas, Containers',     -- cargo_types
  'USD',                      -- currency
  50.00,                      -- average_handling_cost (dollars)
  'Port Address',             -- address
  'contact@port.com',         -- email
  '+1-234-567-8900',          -- phone
  'https://www.port.com',     -- website
  'Port description here'     -- description
);