import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { InsertRefineryPortConnection, insertRefineryPortConnectionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { calculateDistance } from "../utils/geoUtils";

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
      connectionData.distance = distance;
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

    // Update the connection
    const updatedConnection = await storage.updateRefineryPortConnection(id, updateData);
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
    // Get all refineries and ports
    const allRefineries = await storage.getRefineries();
    const allPorts = await storage.getPorts();
    
    let connectionsMade = 0;
    const errors: string[] = [];
    const existingConnections = await storage.getRefineryPortConnections();
    
    // Iterate through each refinery
    for (const refinery of allRefineries) {
      const refineryLat = parseFloat(refinery.lat.toString());
      const refineryLng = parseFloat(refinery.lng.toString());
      
      // Find ports in the same region
      const sameContinentPorts = allPorts.filter(port => port.region === refinery.region);
      
      if (sameContinentPorts.length === 0) {
        errors.push(`No ports found in ${refinery.region} for refinery ${refinery.name}`);
        continue;
      }
      
      // Find the closest port
      let closestPort = sameContinentPorts[0];
      let closestDistance = calculateDistance(
        refineryLat, 
        refineryLng,
        parseFloat(closestPort.lat.toString()), 
        parseFloat(closestPort.lng.toString())
      );
      
      for (let i = 1; i < sameContinentPorts.length; i++) {
        const port = sameContinentPorts[i];
        const distance = calculateDistance(
          refineryLat, 
          refineryLng,
          parseFloat(port.lat.toString()), 
          parseFloat(port.lng.toString())
        );
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPort = port;
        }
      }
      
      // Check if connection already exists
      const existingConnection = existingConnections.find(
        conn => conn.refineryId === refinery.id && conn.portId === closestPort.id
      );
      
      if (existingConnection) {
        continue; // Skip if connection already exists
      }
      
      // Create new connection
      try {
        const newConnection: InsertRefineryPortConnection = {
          refineryId: refinery.id,
          portId: closestPort.id,
          distance: closestDistance,
          connectionType: "pipeline",
          capacity: refinery.capacity ? refinery.capacity * 0.8 : 100000, // 80% of refinery capacity
          status: "active"
        };
        
        await storage.createRefineryPortConnection(newConnection);
        connectionsMade++;
      } catch (error) {
        errors.push(`Error connecting refinery ${refinery.name} to port ${closestPort.name}: ${error}`);
      }
    }
    
    res.json({
      success: true,
      connectionsMade,
      totalRefineries: allRefineries.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error connecting refineries to ports:", error);
    res.status(500).json({ error: "Failed to connect refineries to ports" });
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