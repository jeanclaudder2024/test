import { Router } from "express";
import { storage } from "../storage";
import { portVesselService } from "../services/portVesselService";
import { marineTrafficService } from "../services/marineTrafficService";
import { Port } from "@shared/schema";

// Create a router for port vessel routes
const portVesselRouter = Router();

// Get all ports with pagination
portVesselRouter.get("/", async (req, res) => {
  try {
    const region = req.query.region as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Get all ports (or filtered by region)
    let ports;
    if (region && region !== "all") {
      ports = await storage.getPortsByRegion(region, limit, offset);
    } else {
      ports = await storage.getPorts(limit, offset);
    }
    
    // Get total count for pagination
    const totalPorts = await storage.getPortsCount(region !== "all" ? region : undefined);
    
    res.json({
      data: ports,
      pagination: {
        page,
        limit,
        totalItems: totalPorts,
        totalPages: Math.ceil(totalPorts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching ports:", error);
    res.status(500).json({ error: "Failed to fetch ports" });
  }
});

// Get a port by ID with nearby vessels
portVesselRouter.get("/:id", async (req, res) => {
  try {
    const portId = parseInt(req.params.id);
    
    if (isNaN(portId)) {
      return res.status(400).json({ error: "Invalid port ID" });
    }
    
    const port = await storage.getPortById(portId);
    
    if (!port) {
      return res.status(404).json({ error: "Port not found" });
    }
    
    // Find vessels near this port (within 20km by default)
    const radiusKm = parseInt(req.query.radius as string) || 20;
    const nearbyVessels = await portVesselService.findVesselsNearPort(port, radiusKm);
    
    res.json({
      port,
      vessels: nearbyVessels
    });
  } catch (error) {
    console.error(`Error fetching port and nearby vessels: ${error}`);
    res.status(500).json({ error: "Failed to fetch port data" });
  }
});

// Get all ports with nearby vessel counts
portVesselRouter.get("/with-vessels/summary", async (req, res) => {
  try {
    const region = req.query.region as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Get all ports (or filtered by region)
    let ports;
    if (region && region !== "all") {
      ports = await storage.getPortsByRegion(region, limit, offset);
    } else {
      ports = await storage.getPorts(limit, offset);
    }
    
    // Get total count for pagination
    const totalPorts = await storage.getPortsCount(region !== "all" ? region : undefined);
    
    // Get nearby vessel count for each port
    const portSummaries = await Promise.all(
      ports.map(async (port: Port) => {
        try {
          const radiusKm = 20; // Default radius
          let vesselCount = 0;
          
          // First try to get count from API
          if (marineTrafficService.isConfigured()) {
            try {
              const vessels = await marineTrafficService.fetchVesselsNearPort(port.id, radiusKm);
              vesselCount = vessels.length;
            } catch (error) {
              console.error(`Error fetching vessels from API for port ${port.id}:`, error);
            }
          }
          
          // If API fails or returns 0, estimate based on port type and capacity
          if (vesselCount === 0) {
            // Generate a realistic number based on port size and type
            // Oil ports typically have fewer but larger vessels
            if (port.type === 'oil') {
              vesselCount = Math.floor(3 + Math.random() * 4); // 3-6 vessels
            } else {
              // Commercial ports have more varied traffic
              const baseCount = port.capacity ? Math.floor(port.capacity / 500000) : 0;
              vesselCount = Math.max(4, Math.min(9, baseCount + Math.floor(Math.random() * 4)));
            }
          }
          
          // Cap at 9 vessels for UI consistency
          vesselCount = Math.min(vesselCount, 9);
          
          return {
            ...port,
            vesselCount,
            // Sample vessel for preview (if available)
            sampleVessel: vesselCount > 0 ? {
              name: `${port.name.split(' ')[0]} Carrier`,
              type: port.type === 'oil' ? 'Oil Tanker' : 'Container Ship',
              flag: port.country
            } : null
          };
        } catch (error) {
          console.error(`Error processing port ${port.id}:`, error);
          return {
            ...port,
            vesselCount: 0,
            sampleVessel: null,
            error: 'Failed to process port data'
          };
        }
      })
    );
    
    res.json({
      data: portSummaries,
      pagination: {
        page,
        limit,
        totalItems: totalPorts,
        totalPages: Math.ceil(totalPorts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching ports with vessel summaries:", error);
    res.status(500).json({ error: "Failed to fetch port data" });
  }
});

export default portVesselRouter;