import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { InsertRefineryPortConnection, insertRefineryPortConnectionSchema, InsertVessel } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { calculateDistance } from "../utils/geoUtils";

// Convert numeric values to strings for database compatibility
function convertToStringFields(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'number') {
      result[key] = value.toString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const refineryPortRouter = Router();

// Get all refinery-port connections
refineryPortRouter.get("/connections", async (req: Request, res: Response) => {
  try {
    const connections = await storage.getRefineryPortConnections();
    res.json(connections);
  } catch (error) {
    console.error("Error fetching refinery-port connections:", error);
    res.status(500).json({ error: "Failed to fetch refinery-port connections" });
  }
});

// Get a specific refinery-port connection by ID
refineryPortRouter.get("/connections/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const connection = await storage.getRefineryPortConnectionById(id);
    if (!connection) {
      return res.status(404).json({ error: "Refinery-port connection not found" });
    }

    res.json(connection);
  } catch (error) {
    console.error("Error fetching refinery-port connection:", error);
    res.status(500).json({ error: "Failed to fetch refinery-port connection" });
  }
});

// Get all connections for a specific refinery
refineryPortRouter.get("/refinery/:refineryId/connections", async (req: Request, res: Response) => {
  try {
    const refineryId = parseInt(req.params.refineryId);
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: "Invalid refinery ID format" });
    }

    const connections = await storage.getRefineryPortConnectionsByRefineryId(refineryId);
    res.json(connections);
  } catch (error) {
    console.error("Error fetching refinery connections:", error);
    res.status(500).json({ error: "Failed to fetch refinery connections" });
  }
});

// Get all connections for a specific port
refineryPortRouter.get("/port/:portId/connections", async (req: Request, res: Response) => {
  try {
    const portId = parseInt(req.params.portId);
    if (isNaN(portId)) {
      return res.status(400).json({ error: "Invalid port ID format" });
    }

    const connections = await storage.getRefineryPortConnectionsByPortId(portId);
    res.json(connections);
  } catch (error) {
    console.error("Error fetching port connections:", error);
    res.status(500).json({ error: "Failed to fetch port connections" });
  }
});

// Create a new refinery-port connection
refineryPortRouter.post("/connections", async (req: Request, res: Response) => {
  try {
    // Validate the request data
    const validationResult = insertRefineryPortConnectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return res.status(400).json({ error: validationError.message });
    }

    const connectionData = validationResult.data;

    // Fetch the refinery and port to validate they exist
    const refinery = await storage.getRefineryById(connectionData.refineryId);
    if (!refinery) {
      return res.status(404).json({ error: "Refinery not found" });
    }

    const port = await storage.getPortById(connectionData.portId);
    if (!port) {
      return res.status(404).json({ error: "Port not found" });
    }

    // Calculate distance if not provided
    if (!connectionData.distance) {
      const distance = calculateDistance(
        parseFloat(refinery.lat.toString()), 
        parseFloat(refinery.lng.toString()),
        parseFloat(port.lat.toString()), 
        parseFloat(port.lng.toString())
      );
      connectionData.distance = distance.toString();
    } else if (typeof connectionData.distance === 'number') {
      connectionData.distance = connectionData.distance.toString();
    }

    // Convert capacity to string if it's a number
    if (typeof connectionData.capacity === 'number') {
      connectionData.capacity = connectionData.capacity.toString();
    }

    // Create the connection
    const newConnection = await storage.createRefineryPortConnection(connectionData);
    res.status(201).json(newConnection);
  } catch (error) {
    console.error("Error creating refinery-port connection:", error);
    res.status(500).json({ error: "Failed to create refinery-port connection" });
  }
});

// Update a refinery-port connection
refineryPortRouter.patch("/connections/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Check if connection exists
    const existingConnection = await storage.getRefineryPortConnectionById(id);
    if (!existingConnection) {
      return res.status(404).json({ error: "Refinery-port connection not found" });
    }

    // Validate the update data
    const validationResult = z.object({
      refineryId: z.number().optional(),
      portId: z.number().optional(),
      distance: z.number().optional(),
      connectionType: z.string().optional(),
      capacity: z.number().optional(),
      status: z.string().optional()
    }).safeParse(req.body);

    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      return res.status(400).json({ error: validationError.message });
    }

    const updateData = validationResult.data;
    
    // Convert numeric values to strings for database compatibility
    const stringifiedData: Record<string, any> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (typeof value === 'number') {
        stringifiedData[key] = value.toString();
      } else {
        stringifiedData[key] = value;
      }
    }

    // Update the connection
    const updatedConnection = await storage.updateRefineryPortConnection(id, stringifiedData);
    res.json(updatedConnection);
  } catch (error) {
    console.error("Error updating refinery-port connection:", error);
    res.status(500).json({ error: "Failed to update refinery-port connection" });
  }
});

// Delete a refinery-port connection
refineryPortRouter.delete("/connections/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Check if connection exists
    const existingConnection = await storage.getRefineryPortConnectionById(id);
    if (!existingConnection) {
      return res.status(404).json({ error: "Refinery-port connection not found" });
    }

    // Delete the connection
    const result = await storage.deleteRefineryPortConnection(id);
    res.json({ success: result });
  } catch (error) {
    console.error("Error deleting refinery-port connection:", error);
    res.status(500).json({ error: "Failed to delete refinery-port connection" });
  }
});

// Connect all refineries to nearby ports
refineryPortRouter.post("/connect-all", async (req: Request, res: Response) => {
  try {
    // First clear all existing connections if requested
    const clearExisting = req.query.clearExisting === 'true';
    if (clearExisting) {
      console.log("Clearing all existing refinery-port connections");
      const allConnections = await storage.getRefineryPortConnections();
      for (const conn of allConnections) {
        await storage.deleteRefineryPortConnection(conn.id);
      }
      console.log(`Cleared ${allConnections.length} existing connections`);
    }
    
    // Get all refineries and ports
    const allRefineries = await storage.getRefineries();
    const allPorts = await storage.getPorts();
    const allVessels = await storage.getVessels();
    
    console.log(`Retrieved ${allRefineries.length} refineries, ${allPorts.length} ports, and ${allVessels.length} vessels`);
    
    let connectionsMade = 0;
    const errors: string[] = [];
    
    // Get any existing connections that weren't cleared
    const existingConnections = await storage.getRefineryPortConnections();
    
    // Set a reasonable distance threshold (in kilometers)
    // This determines which ports are considered "nearby" to a refinery
    const DISTANCE_THRESHOLD = 15; // increased from 5 to 15 to find more ports
    
    // Iterate through each refinery
    for (const refinery of allRefineries) {
      const refineryLat = parseFloat(refinery.lat.toString());
      const refineryLng = parseFloat(refinery.lng.toString());
      
      // Helper function to normalize region names for comparison
      const normalizeRegion = (region: string): string => {
        region = region.toLowerCase();
        
        // Map of equivalent regions
        const regionMap: Record<string, string[]> = {
          'europe': ['europe', 'western-europe', 'eastern-europe'],
          'asia-pacific': ['asia-pacific', 'asia', 'east-asia', 'china'],
          'middle east': ['middle east', 'middle-east'],
          'latin america': ['latin america', 'south-america', 'central-america'],
          'north america': ['north america', 'north-america'],
          'africa': ['africa', 'north-africa', 'southern-africa'],
          'oceania': ['oceania', 'southeast-asia-oceania']
        };
        
        // Find the normalized region
        for (const [normalizedRegion, variants] of Object.entries(regionMap)) {
          if (variants.some(v => region.includes(v))) {
            return normalizedRegion;
          }
        }
        
        return region;
      };
      
      // Find ports in the same region using normalized region comparison
      const refineryNormalizedRegion = normalizeRegion(refinery.region);
      const regionalPorts = allPorts.filter(port => {
        const portNormalizedRegion = normalizeRegion(port.region);
        return portNormalizedRegion === refineryNormalizedRegion;
      });
      
      if (regionalPorts.length === 0) {
        // If no regional ports, get global ports
        console.log(`No ports found in normalized region '${refineryNormalizedRegion}' for refinery ${refinery.name} (original region: ${refinery.region})`);
        errors.push(`No ports found in normalized region '${refineryNormalizedRegion}' for refinery ${refinery.name}`);
        continue;
      }
      
      // Find all ports within the distance threshold
      const nearbyPorts = [];
      let closestPort = null;
      let closestDistance = Infinity;
      
      for (const port of regionalPorts) {
        try {
          const portLat = parseFloat(port.lat.toString());
          const portLng = parseFloat(port.lng.toString());
          
          const distance = calculateDistance(refineryLat, refineryLng, portLat, portLng);
          
          // Keep track of the closest port
          if (distance < closestDistance) {
            closestDistance = distance;
            closestPort = port;
          }
          
          // If port is within threshold, add it to nearby ports
          if (distance <= DISTANCE_THRESHOLD) {
            nearbyPorts.push({ port, distance });
          }
        } catch (error) {
          console.error(`Error calculating distance for port ${port.name}:`, error);
        }
      }
      
      // If no nearby ports found within threshold, use the closest port
      if (nearbyPorts.length === 0 && closestPort) {
        nearbyPorts.push({ port: closestPort, distance: closestDistance });
      }
      
      // Sort nearby ports by distance (closest first)
      nearbyPorts.sort((a, b) => a.distance - b.distance);
      
      // Create connections for each nearby port
      for (const { port, distance } of nearbyPorts) {
        // Check if connection already exists
        const existingConnection = existingConnections.find(
          conn => conn.refineryId === refinery.id && conn.portId === port.id
        );
        
        if (existingConnection && !clearExisting) {
          console.log(`Connection between refinery ${refinery.name} and port ${port.name} already exists`);
          continue; // Skip if connection already exists and we're not clearing
        }
        
        // Create new connection
        try {
          const capacity = refinery.capacity ? refinery.capacity * 0.8 : 100000;
          
          // Determine pipeline type based on distance
          let connectionType = "pipeline";
          if (distance > 10) {
            connectionType = "shipping"; // For longer distances, assume shipping is used
          }
          
          // Create connection without lastUpdated field (handled by database default)
          const newConnection: InsertRefineryPortConnection = {
            refineryId: refinery.id,
            portId: port.id,
            distance: distance.toString(),
            connectionType: connectionType,
            capacity: capacity.toString(), // 80% of refinery capacity
            status: "active"
          };
          
          await storage.createRefineryPortConnection(newConnection);
          connectionsMade++;
          console.log(`Created connection between refinery ${refinery.name} and port ${port.name} (${distance.toFixed(2)} km)`);
        } catch (error) {
          errors.push(`Error connecting refinery ${refinery.name} to port ${port.name}: ${error}`);
        }
      }
    }
    
    // Now update vessel departure and destination ports based on their current position
    console.log("Updating vessel port connections based on current positions...");
    let vesselPortUpdates = 0;
    
    // Update vessel-to-port connections
    for (const vessel of allVessels) {
      if (!vessel.currentLat || !vessel.currentLng) continue;
      
      const vesselLat = parseFloat(vessel.currentLat);
      const vesselLng = parseFloat(vessel.currentLng);
      
      // Find the nearest port to the vessel's current position
      let closestPort = null;
      let closestDistance = Infinity;
      
      for (const port of allPorts) {
        const portLat = parseFloat(port.lat.toString());
        const portLng = parseFloat(port.lng.toString());
        
        const distance = calculateDistance(vesselLat, vesselLng, portLat, portLng);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPort = port;
        }
      }
      
      if (closestPort) {
        // Update vessel with nearest port as destination if it's within a reasonable distance
        const nearbyDistanceThreshold = 50; // 50 km is considered "nearby" for a vessel
        
        try {
          let needsUpdate = false;
          const updates: Partial<InsertVessel> = {};
          
          // If vessel is near a port, use it as destination
          if (closestDistance <= nearbyDistanceThreshold) {
            if (vessel.destinationPort !== closestPort.name) {
              updates.destinationPort = closestPort.name;
              needsUpdate = true;
            }
          }
          
          // Find a sensible departure port (use port from same region if destination is set)
          if (!vessel.departurePort) {
            const departureRegion = vessel.currentRegion || (closestPort ? closestPort.region : null);
            if (departureRegion) {
              const possibleDeparturePorts = allPorts.filter(p => p.region === departureRegion && p.id !== closestPort?.id);
              if (possibleDeparturePorts.length > 0) {
                // Select a random port from the same region as departure
                const randomPort = possibleDeparturePorts[Math.floor(Math.random() * possibleDeparturePorts.length)];
                updates.departurePort = randomPort.name;
                needsUpdate = true;
              }
            }
          }
          
          if (needsUpdate) {
            await storage.updateVessel(vessel.id, updates);
            vesselPortUpdates++;
          }
        } catch (error) {
          console.error(`Error updating vessel ${vessel.name} port connections:`, error);
        }
      }
    }
    
    res.json({
      success: true,
      connectionsMade,
      totalRefineries: allRefineries.length,
      vesselPortUpdates,
      timestamp: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error connecting refineries to ports:", error);
    res.status(500).json({ error: "Failed to connect refineries to ports", details: error.message });
  }
});

// Get all ports associated with a specific refinery including the connection details
refineryPortRouter.get("/refinery/:refineryId/ports", async (req: Request, res: Response) => {
  try {
    const refineryId = parseInt(req.params.refineryId);
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: "Invalid refinery ID format" });
    }

    // Get refinery to confirm it exists
    const refinery = await storage.getRefineryById(refineryId);
    if (!refinery) {
      return res.status(404).json({ error: "Refinery not found" });
    }

    // Get all connections for this refinery
    const connections = await storage.getRefineryPortConnectionsByRefineryId(refineryId);
    
    // Early return if no connections
    if (connections.length === 0) {
      return res.json([]);
    }

    // Get all the connected ports
    const connectedPorts = [];
    for (const connection of connections) {
      const port = await storage.getPortById(connection.portId);
      if (port) {
        connectedPorts.push({
          ...port,
          connection: {
            id: connection.id,
            distance: connection.distance,
            connectionType: connection.connectionType,
            capacity: connection.capacity,
            status: connection.status
          }
        });
      }
    }

    res.json(connectedPorts);
  } catch (error) {
    console.error("Error fetching ports for refinery:", error);
    res.status(500).json({ error: "Failed to fetch ports for refinery" });
  }
});