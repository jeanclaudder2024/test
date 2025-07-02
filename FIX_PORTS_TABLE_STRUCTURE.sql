-- Fix Ports Table Structure - Add Missing Columns
-- Run this to add all missing columns needed for the professional port management system

-- Basic Operations Data
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "annualThroughput" INTEGER;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "operatingHours" TEXT DEFAULT '24/7';

-- Port Authority & Management
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "portAuthority" TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS owner TEXT;

-- Technical Specifications
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "maxVesselLength" DECIMAL(8,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "maxVesselBeam" DECIMAL(6,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "maxDraught" DECIMAL(6,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "channelDepth" DECIMAL(6,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "berthCount" INTEGER;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "totalBerthLength" DECIMAL(8,2);

-- Operational Requirements
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "pilotageRequired" BOOLEAN DEFAULT false;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "tugAssistance" BOOLEAN DEFAULT false;

-- Infrastructure Connectivity
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "railConnections" BOOLEAN DEFAULT false;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "roadConnections" BOOLEAN DEFAULT true;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "airportDistance" DECIMAL(6,2);

-- Facilities Information
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "warehouseArea" DECIMAL(10,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "storageCapacity" DECIMAL(12,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "customsFacilities" BOOLEAN DEFAULT true;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "quarantineFacilities" BOOLEAN DEFAULT false;

-- Security & Safety
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "securityLevel" TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "safetyRecord" TEXT;

-- Services & Operations
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "availableServices" TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "cargoTypes" TEXT;

-- Contact Information (if missing)
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "postalCode" TEXT;

-- Financial Information
ALTER TABLE ports ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "averageHandlingCost" DECIMAL(10,2);

-- Statistics & Monitoring
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "vesselCount" INTEGER DEFAULT 0;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "totalCargo" DECIMAL(15,2) DEFAULT 0;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "connectedRefineries" INTEGER DEFAULT 0;

-- Environmental & Operational Data
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "averageWaitTime" DECIMAL(5,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "weatherRestrictions" TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "tidalRange" DECIMAL(4,2);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "portCharges" TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "nearbyPorts" TEXT;

-- Metadata
ALTER TABLE ports ADD COLUMN IF NOT EXISTS established INTEGER;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "lastInspection" TIMESTAMP;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "nextInspection" TIMESTAMP;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT NOW();
ALTER TABLE ports ADD COLUMN IF NOT EXISTS "lastUpdated" TIMESTAMP DEFAULT NOW();

-- Show updated table structure
SELECT 'All missing columns have been added to the ports table.' AS status;

-- Verify key columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ports' 
AND column_name IN ('annualThroughput', 'portAuthority', 'maxVesselLength', 'operatingHours')
ORDER BY column_name;