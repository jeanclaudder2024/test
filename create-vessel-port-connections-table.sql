-- Create vessel_port_connections table for proper database relationships
CREATE TABLE IF NOT EXISTS vessel_port_connections (
  id SERIAL PRIMARY KEY,
  vessel_id INTEGER NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
  port_id INTEGER NOT NULL REFERENCES ports(id) ON DELETE CASCADE,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('departure', 'arrival', 'nearby')),
  distance DECIMAL(10,2), -- distance in kilometers
  estimated_time TIMESTAMP, -- ETA or ETD
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  
  -- Create unique constraint to prevent duplicate connections
  UNIQUE(vessel_id, port_id, connection_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vessel_port_connections_vessel_id ON vessel_port_connections(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_port_connections_port_id ON vessel_port_connections(port_id);
CREATE INDEX IF NOT EXISTS idx_vessel_port_connections_type ON vessel_port_connections(connection_type);

-- Insert some sample connections to demonstrate the system
-- (Only insert if we have vessels and ports)
INSERT INTO vessel_port_connections (vessel_id, port_id, connection_type, distance, status)
SELECT 
    v.id as vessel_id,
    p.id as port_id,
    'departure' as connection_type,
    0 as distance,
    'active' as status
FROM vessels v
CROSS JOIN ports p
WHERE v.departure_port = p.name
  AND NOT EXISTS (
    SELECT 1 FROM vessel_port_connections vpc 
    WHERE vpc.vessel_id = v.id AND vpc.port_id = p.id AND vpc.connection_type = 'departure'
  )
LIMIT 10; -- Limit to prevent too many connections

INSERT INTO vessel_port_connections (vessel_id, port_id, connection_type, distance, status)
SELECT 
    v.id as vessel_id,
    p.id as port_id,
    'arrival' as connection_type,
    0 as distance,
    'active' as status
FROM vessels v
CROSS JOIN ports p
WHERE v.destination_port = p.name
  AND NOT EXISTS (
    SELECT 1 FROM vessel_port_connections vpc 
    WHERE vpc.vessel_id = v.id AND vpc.port_id = p.id AND vpc.connection_type = 'arrival'
  )
LIMIT 10; -- Limit to prevent too many connections