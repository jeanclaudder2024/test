import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { refineries } from "@shared/schema";
import { eq } from "drizzle-orm";
import { refineryAIEnhancer } from "../services/refineryAIEnhancer";

export const refineryRouter = Router();

// Get all refineries
refineryRouter.get("/", async (req: Request, res: Response) => {
  try {
    const refineriesData = await storage.getRefineries();
    
    // Allow filtering by region, country, or status
    const { region, country, status } = req.query;
    
    let filteredRefineries = refineriesData;
    
    if (region) {
      filteredRefineries = filteredRefineries.filter(r => 
        r.region?.toLowerCase().includes(String(region).toLowerCase())
      );
    }
    
    if (country) {
      filteredRefineries = filteredRefineries.filter(r => 
        r.country?.toLowerCase().includes(String(country).toLowerCase())
      );
    }
    
    if (status) {
      filteredRefineries = filteredRefineries.filter(r => 
        r.status?.toLowerCase().includes(String(status).toLowerCase())
      );
    }
    
    res.json(filteredRefineries);
  } catch (error) {
    console.error("Error fetching refineries:", error);
    res.status(500).json({ error: "Failed to fetch refineries" });
  }
});

// Get a specific refinery by ID
refineryRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const refinery = await storage.getRefineryById(id);
    if (!refinery) {
      return res.status(404).json({ error: "Refinery not found" });
    }

    // Parse JSON strings to objects if they exist
    let enhancedRefinery = {...refinery};
    
    if (refinery.products && typeof refinery.products === 'string') {
      try {
        enhancedRefinery.products = JSON.parse(refinery.products);
      } catch (e) {
        console.error(`Error parsing products JSON for refinery ${id}:`, e);
      }
    }
    
    if (refinery.technicalSpecs && typeof refinery.technicalSpecs === 'string') {
      try {
        enhancedRefinery.technicalSpecs = JSON.parse(refinery.technicalSpecs);
      } catch (e) {
        console.error(`Error parsing technicalSpecs JSON for refinery ${id}:`, e);
      }
    }

    res.json(enhancedRefinery);
  } catch (error) {
    console.error("Error fetching refinery:", error);
    res.status(500).json({ error: "Failed to fetch refinery" });
  }
});

// Enhance a refinery with AI-generated data
refineryRouter.post("/:id/enhance", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const refinery = await storage.getRefineryById(id);
    if (!refinery) {
      return res.status(404).json({ error: "Refinery not found" });
    }

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        error: "OpenAI API key is required for AI enhancement",
        missingKey: true
      });
    }

    // Enhance the refinery with AI-generated data
    const [enhancedRefinery] = await refineryAIEnhancer.enhanceAndUpdateRefineries([id]);

    res.json(enhancedRefinery);
  } catch (error) {
    console.error("Error enhancing refinery:", error);
    res.status(500).json({ error: "Failed to enhance refinery" });
  }
});

// Get all vessels associated with a refinery
refineryRouter.get("/:id/vessels", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const refinery = await storage.getRefineryById(id);
    if (!refinery) {
      return res.status(404).json({ error: "Refinery not found" });
    }

    // Fetch vessels that have this refinery as destination or departure
    // This assumes vessel.destinationPort or vessel.departurePort might contain "REF:{id}:{name}" format
    const allVessels = await storage.getVessels();
    
    const associatedVessels = allVessels.filter(vessel => {
      const destinationRefString = `REF:${id}:`;
      const departureRefString = `REF:${id}:`;
      
      return (
        (vessel.destinationPort && vessel.destinationPort.startsWith(destinationRefString)) ||
        (vessel.departurePort && vessel.departurePort.startsWith(departureRefString))
      );
    });

    res.json(associatedVessels);
  } catch (error) {
    console.error("Error fetching vessels for refinery:", error);
    res.status(500).json({ error: "Failed to fetch vessels for refinery" });
  }
});

// Update a refinery
refineryRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const refinery = await storage.getRefineryById(id);
    if (!refinery) {
      return res.status(404).json({ error: "Refinery not found" });
    }

    // Convert arrays to JSON strings
    let updateData = {...req.body};
    
    if (updateData.products && Array.isArray(updateData.products)) {
      updateData.products = JSON.stringify(updateData.products);
    }
    
    if (updateData.technicalSpecs && typeof updateData.technicalSpecs === 'object') {
      updateData.technicalSpecs = JSON.stringify(updateData.technicalSpecs);
    }
    
    // Update the refinery
    await db.update(refineries)
      .set({
        ...updateData,
        lastUpdated: new Date()
      })
      .where(eq(refineries.id, id));

    const updatedRefinery = await storage.getRefineryById(id);
    res.json(updatedRefinery);
  } catch (error) {
    console.error("Error updating refinery:", error);
    res.status(500).json({ error: "Failed to update refinery" });
  }
});

// Get ports connected to a refinery
refineryRouter.get("/:id/connected-ports", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const refinery = await storage.getRefineryById(id);
    if (!refinery) {
      return res.status(404).json({ error: "Refinery not found" });
    }

    // Get refinery port connections
    const connections = await storage.getRefineryPortConnectionsByRefineryId(id);
    
    // Early return if no connections
    if (connections.length === 0) {
      return res.json([]);
    }

    // Get port details for each connection
    const connectedPorts = [];
    for (const connection of connections) {
      const port = await storage.getPortById(connection.portId);
      if (port) {
        // Calculate estimated transit time based on distance
        // Assuming average vessel speed of 15 nautical miles per hour (27.78 km/h)
        const distanceKm = parseFloat(String(connection.distance));
        const transitTimeHours = isNaN(distanceKm) ? null : distanceKm / 27.78;
        
        connectedPorts.push({
          ...port,
          connection: {
            id: connection.id,
            distance: connection.distance,
            connectionType: connection.connectionType,
            transitTimeHours: transitTimeHours ? Math.round(transitTimeHours * 10) / 10 : null, // Round to 1 decimal place
            transitTimeDays: transitTimeHours ? Math.round(transitTimeHours / 24 * 10) / 10 : null,
            capacity: connection.capacity,
            status: connection.status
          }
        });
      }
    }

    res.json(connectedPorts);
  } catch (error) {
    console.error("Error fetching connected ports for refinery:", error);
    res.status(500).json({ error: "Failed to fetch connected ports" });
  }
});

// Get regional statistics for refineries
refineryRouter.get("/stats/regional", async (req: Request, res: Response) => {
  try {
    const allRefineries = await storage.getRefineries();
    
    // Group refineries by region and calculate statistics
    const regionStats: Record<string, {
      count: number;
      activeCount: number;
      totalCapacity: number;
      avgCapacity: number;
      refineries: typeof allRefineries;
    }> = {};
    
    for (const refinery of allRefineries) {
      const region = refinery.region || 'Unknown';
      
      if (!regionStats[region]) {
        regionStats[region] = {
          count: 0,
          activeCount: 0,
          totalCapacity: 0,
          avgCapacity: 0,
          refineries: []
        };
      }
      
      regionStats[region].count++;
      
      if (refinery.status === 'active') {
        regionStats[region].activeCount++;
      }
      
      if (refinery.capacity) {
        regionStats[region].totalCapacity += refinery.capacity;
      }
      
      regionStats[region].refineries.push(refinery);
    }
    
    // Calculate average capacity
    for (const region in regionStats) {
      if (regionStats[region].count > 0) {
        regionStats[region].avgCapacity = regionStats[region].totalCapacity / regionStats[region].count;
      }
    }
    
    res.json(regionStats);
  } catch (error) {
    console.error("Error fetching refinery regional stats:", error);
    res.status(500).json({ error: "Failed to fetch refinery statistics" });
  }
});

export default refineryRouter;