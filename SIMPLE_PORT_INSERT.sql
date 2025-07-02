-- Simple Port Insert - Only Basic Columns
-- Use this AFTER running FIX_PORTS_TABLE_STRUCTURE.sql

-- Basic insert with only essential columns that should exist
INSERT INTO ports (name, country, region, city, lat, lng, type, status, description) 
VALUES (
  'Test Port',
  'Test Country', 
  'Test Region',
  'Test City',
  25.0000,
  55.0000,
  'commercial',
  'operational',
  'Test port description'
);

-- After adding missing columns, you can use this comprehensive version:
-- INSERT INTO ports (
--   name, country, region, city, lat, lng, timezone,
--   type, status, capacity, "annualThroughput",
--   "maxVesselLength", "maxVesselBeam", "maxDraught", "channelDepth",
--   "berthCount", "totalBerthLength", "portAuthority", operator,
--   "operatingHours", "pilotageRequired", "tugAssistance",
--   "railConnections", "roadConnections", "airportDistance",
--   "warehouseArea", "storageCapacity", "securityLevel",
--   "customsFacilities", "quarantineFacilities", "safetyRecord",
--   "availableServices", "cargoTypes", currency, "averageHandlingCost",
--   address, email, phone, website, description
-- ) VALUES (
--   'Port of Hamburg',
--   'Germany',
--   'Europe', 
--   'Hamburg',
--   53.5472,
--   9.9680,
--   'CET',
--   'commercial',
--   'operational',
--   8000000,
--   130000000,
--   400.0,
--   59.0,
--   15.5,
--   17.0,
--   300,
--   43000.0,
--   'Hamburg Port Authority',
--   'HHLA Hamburg Hafen und Logistik AG',
--   '24/7',
--   true,
--   true,
--   true,
--   true,
--   8.0,
--   500000.0,
--   5000000.0,
--   'ISPS Level 1',
--   true,
--   true,
--   'Very Good',
--   'Container handling, Ro-Ro, Break bulk, Storage, Rail connections',
--   'Containers, General Cargo, Bulk, Ro-Ro',
--   'EUR',
--   120.00,
--   'Bei St. Annen 1, 20457 Hamburg, Germany',
--   'info@hamburg-port.de',
--   '+49 40 4288-0',
--   'https://www.hamburg-port.de',
--   'Gateway to the world - Germany largest seaport and third-largest in Europe'
-- );