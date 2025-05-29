import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { vessels, ports, vesselPortConnections } from "@shared/schema";

const router = express.Router();

// Simple function to create vessel-port connections based on departure and destination ports
export async function createVesselPortConnections() {
  try {
    console.log("Creating vessel-port connections...");
    
    // Get all vessels with departure and destination ports
    const allVessels = await db.select().from(vessels);
    const allPorts = await db.select().from(ports);
    
    let connectionsCreated = 0;
    
    for (const vessel of allVessels) {
      // Find departure port
      if (vessel.departurePort) {
        const departurePort = allPorts.find(port => 
          port.name.toLowerCase().includes(vessel.departurePort?.toLowerCase() || '') ||
          vessel.departurePort?.toLowerCase().includes(port.name.toLowerCase())
        );
        
        if (departurePort) {
          try {
            await db.insert(vesselPortConnections).values({
              vesselId: vessel.id,
              portId: departurePort.id,
              connectionType: 'departure',
              distance: '0',
              status: 'active'
            }).onConflictDoNothing();
            connectionsCreated++;
          } catch (error) {
            // Ignore duplicate entries
          }
        }
      }
      
      // Find destination port
      if (vessel.destinationPort) {
        const destinationPort = allPorts.find(port => 
          port.name.toLowerCase().includes(vessel.destinationPort?.toLowerCase() || '') ||
          vessel.destinationPort?.toLowerCase().includes(port.name.toLowerCase())
        );
        
        if (destinationPort) {
          try {
            await db.insert(vesselPortConnections).values({
              vesselId: vessel.id,
              portId: destinationPort.id,
              connectionType: 'arrival',
              distance: '0',
              status: 'active'
            }).onConflictDoNothing();
            connectionsCreated++;
          } catch (error) {
            // Ignore duplicate entries
          }
        }
      }
    }
    
    console.log(`Created ${connectionsCreated} vessel-port connections`);
    return { success: true, connectionsCreated };
    
  } catch (error) {
    console.error("Error creating vessel-port connections:", error);
    return { success: false, error: String(error) };
  }
}

// API endpoint to create connections
router.post('/create-connections', async (req, res) => {
  const result = await createVesselPortConnections();
  res.json(result);
});

// API endpoint to get vessel connections for a specific port
router.get('/port/:portId/vessels', async (req, res) => {
  try {
    const portId = parseInt(req.params.portId);
    
    const connections = await db
      .select({
        vesselId: vesselPortConnections.vesselId,
        vesselName: vessels.name,
        vesselType: vessels.vesselType,
        vesselImo: vessels.imo,
        connectionType: vesselPortConnections.connectionType,
        distance: vesselPortConnections.distance,
        status: vesselPortConnections.status
      })
      .from(vesselPortConnections)
      .innerJoin(vessels, eq(vesselPortConnections.vesselId, vessels.id))
      .where(eq(vesselPortConnections.portId, portId));
    
    res.json({
      success: true,
      portId,
      connections,
      departing: connections.filter(c => c.connectionType === 'departure'),
      arriving: connections.filter(c => c.connectionType === 'arrival'),
      nearby: connections.filter(c => c.connectionType === 'nearby')
    });
    
  } catch (error) {
    console.error("Error getting vessel connections:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

export default router;