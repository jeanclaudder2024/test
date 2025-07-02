-- Enhanced Ports Schema - Professional Port Management Features
-- Add comprehensive columns for advanced port data management

-- Add new columns to ports table for enhanced professional features
ALTER TABLE ports ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS classification TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS annual_throughput INTEGER;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS max_vessel_length TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS max_vessel_beam TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS max_draught TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS channel_depth TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS berth_count INTEGER;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS total_berth_length TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS port_authority TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS operating_hours TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS pilotage_required BOOLEAN DEFAULT FALSE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS tug_assistance BOOLEAN DEFAULT FALSE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS rail_connections BOOLEAN DEFAULT FALSE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS road_connections BOOLEAN DEFAULT TRUE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS airport_distance TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS warehouse_area TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS storage_capacity TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS security_level TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS customs_facilities BOOLEAN DEFAULT TRUE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS quarantine_facilities BOOLEAN DEFAULT FALSE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS safety_record TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS available_services TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS cargo_types TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE ports ADD COLUMN IF NOT EXISTS average_handling_cost TEXT;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS website TEXT;

-- Add indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_ports_classification ON ports(classification);
CREATE INDEX IF NOT EXISTS idx_ports_security_level ON ports(security_level);
CREATE INDEX IF NOT EXISTS idx_ports_port_authority ON ports(port_authority);
CREATE INDEX IF NOT EXISTS idx_ports_operating_hours ON ports(operating_hours);
CREATE INDEX IF NOT EXISTS idx_ports_customs_facilities ON ports(customs_facilities);
CREATE INDEX IF NOT EXISTS idx_ports_pilotage_required ON ports(pilotage_required);

-- Update existing ports with default values for new boolean columns
UPDATE ports SET 
  pilotage_required = FALSE,
  tug_assistance = FALSE,
  rail_connections = FALSE,
  road_connections = TRUE,
  customs_facilities = TRUE,
  quarantine_facilities = FALSE
WHERE pilotage_required IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN ports.timezone IS 'Port timezone (e.g., CET, PST, JST)';
COMMENT ON COLUMN ports.classification IS 'Port classification or category';
COMMENT ON COLUMN ports.annual_throughput IS 'Annual cargo throughput in TEU or tons';
COMMENT ON COLUMN ports.max_vessel_length IS 'Maximum vessel length accepted (meters)';
COMMENT ON COLUMN ports.max_vessel_beam IS 'Maximum vessel beam accepted (meters)';
COMMENT ON COLUMN ports.max_draught IS 'Maximum vessel draught accepted (meters)';
COMMENT ON COLUMN ports.channel_depth IS 'Main navigation channel depth (meters)';
COMMENT ON COLUMN ports.berth_count IS 'Total number of berths available';
COMMENT ON COLUMN ports.total_berth_length IS 'Total berth length (meters)';
COMMENT ON COLUMN ports.port_authority IS 'Port authority organization name';
COMMENT ON COLUMN ports.operating_hours IS 'Port operating hours (e.g., 24/7, 06:00-22:00)';
COMMENT ON COLUMN ports.pilotage_required IS 'Whether pilotage services are mandatory';
COMMENT ON COLUMN ports.tug_assistance IS 'Whether tugboat assistance is available';
COMMENT ON COLUMN ports.rail_connections IS 'Direct rail connectivity available';
COMMENT ON COLUMN ports.road_connections IS 'Road/highway connectivity available';
COMMENT ON COLUMN ports.airport_distance IS 'Distance to nearest airport (km)';
COMMENT ON COLUMN ports.warehouse_area IS 'Total warehouse area (square meters)';
COMMENT ON COLUMN ports.storage_capacity IS 'Total storage capacity';
COMMENT ON COLUMN ports.security_level IS 'ISPS security level (Level 1, 2, or 3)';
COMMENT ON COLUMN ports.customs_facilities IS 'On-site customs and immigration facilities';
COMMENT ON COLUMN ports.quarantine_facilities IS 'Quarantine and health inspection facilities';
COMMENT ON COLUMN ports.safety_record IS 'Overall safety performance record';
COMMENT ON COLUMN ports.available_services IS 'List of available port services';
COMMENT ON COLUMN ports.cargo_types IS 'Types of cargo handled';
COMMENT ON COLUMN ports.currency IS 'Primary currency for port transactions';
COMMENT ON COLUMN ports.average_handling_cost IS 'Average cargo handling cost';
COMMENT ON COLUMN ports.website IS 'Port official website URL';

-- Verification query to check new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ports' 
AND column_name IN (
  'timezone', 'classification', 'annual_throughput', 'max_vessel_length', 
  'max_vessel_beam', 'max_draught', 'channel_depth', 'berth_count', 
  'total_berth_length', 'port_authority', 'operating_hours', 'pilotage_required',
  'tug_assistance', 'rail_connections', 'road_connections', 'airport_distance',
  'warehouse_area', 'storage_capacity', 'security_level', 'customs_facilities',
  'quarantine_facilities', 'safety_record', 'available_services', 'cargo_types',
  'currency', 'average_handling_cost', 'website'
)
ORDER BY column_name;