import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vesselService } from "./services/vesselService";
import { refineryService } from "./services/refineryService";
import { aiService } from "./services/aiService";
// Replace dataService from asiStreamService with marineTrafficService
import { marineTrafficService } from "./services/marineTrafficService";
import { brokerService } from "./services/brokerService";
import { stripeService } from "./services/stripeService";
import { updateRefineryCoordinates, seedMissingRefineries } from "./services/refineryUpdate";
import { seedAllData, regenerateGlobalVessels } from "./services/seedService";
import { setupAuth } from "./auth";
import { db } from "./db";
import { REGIONS } from "@shared/constants";
import { 
  insertVesselSchema, 
  insertRefinerySchema, 
  insertProgressEventSchema,
  insertDocumentSchema,
  insertBrokerSchema,
  Vessel,
  Refinery,
  vessels,
  refineries,
  progressEvents,
  documents,
  stats
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { apiTesterRouter } from "./routes/apiTester";
import { brokerRouter } from "./routes/brokerRoutes";
import { tradingRouter } from "./routes/tradingRoutes";
import { vesselDistributionRouter } from "./routes/vesselDistributionRoutes";
import { seedBrokers } from "./services/seedService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  const apiRouter = express.Router();

  // Endpoint to clear all vessel and refinery data from the database
  if (app.get("env") === "development") {
    apiRouter.post("/clear-data", async (req, res) => {
      try {
        console.log("Starting database clearing process...");
        
        // Delete all vessels
        console.log("Deleting all vessels...");
        const vesselsDeleted = await db.delete(vessels).returning();
        console.log(`Deleted ${vesselsDeleted.length} vessels.`);
        
        // Delete all refineries
        console.log("Deleting all refineries...");
        const refineriesDeleted = await db.delete(refineries).returning();
        console.log(`Deleted ${refineriesDeleted.length} refineries.`);
        
        // Delete all progress events
        console.log("Deleting all progress events...");
        const eventsDeleted = await db.delete(progressEvents).returning();
        console.log(`Deleted ${eventsDeleted.length} progress events.`);
        
        // Delete all documents related to vessels
        console.log("Deleting all vessel documents...");
        const documentsDeleted = await db.delete(documents).returning();
        console.log(`Deleted ${documentsDeleted.length} documents.`);
        
        // Reset stats
        // Update via direct db query to include lastUpdated field
        await db.update(stats).set({ 
          activeVessels: 0, 
          totalCargo: "0",
          activeRefineries: 0,
          lastUpdated: new Date()
        });
        
        res.json({ 
          success: true, 
          message: "All vessel and refinery data has been deleted",
          deleted: {
            vessels: vesselsDeleted.length,
            refineries: refineriesDeleted.length,
            progressEvents: eventsDeleted.length,
            documents: documentsDeleted.length
          }
        });
      } catch (error) {
        console.error("Error clearing database:", error);
        res.status(500).json({ message: "Failed to clear data" });
      }
    });
    
    // Initialize with seed data in development
    // Route to refresh vessel data with force parameter
    apiRouter.post("/vessels/refresh", async (req, res) => {
      try {
        console.log("Refreshing vessel data with new vessel types...");
        const forceRefresh = true; // Force refresh to regenerate all vessels
        
        // Use the seedVesselData function with forceRefresh = true
        const vesselResult = await vesselService.seedVesselData(forceRefresh);
        console.log("Vessel data refreshed successfully:", vesselResult);
        
        res.json({
          success: true,
          message: "Vessel data has been completely refreshed with new vessel types",
          data: {
            vessels: vesselResult.vessels || 0,
            oilVessels: vesselResult.oilVessels || 0,
            totalCargo: vesselResult.totalCargo || 0
          }
        });
      } catch (error) {
        console.error("Error refreshing vessel data:", error);
        res.status(500).json({ message: "Failed to refresh vessel data" });
      }
    });

    apiRouter.post("/seed", async (req, res) => {
      try {
        console.log("Starting database seeding process...");
        
        // Seed data in a more controlled way to avoid errors
        let vesselResult = { vessels: 0, oilVessels: 0, totalCargo: 0 };
        let refineryResult = { refineries: 0, active: 0 };
        
        try {
          // Seed refineries first as they have fewer potential conflicts
          console.log("Seeding refinery data...");
          refineryResult = await refineryService.seedRefineryData();
          console.log("Refinery data seeded successfully:", refineryResult);
        } catch (refineryError) {
          console.error("Error seeding refinery data:", refineryError);
          // Continue to vessel seeding even if refinery seeding fails
        }
        
        try {
          // Then seed vessels
          console.log("Seeding vessel data...");
          vesselResult = await vesselService.seedVesselData();
          console.log("Vessel data seeded successfully:", vesselResult);
        } catch (vesselError) {
          console.error("Error seeding vessel data:", vesselError);
          // Continue with what we have
        }

        // Seed broker data
        let brokerResult = { count: 0, seeded: false };
        try {
          console.log("Seeding broker data...");
          brokerResult = await seedBrokers();
          console.log("Broker data seeded successfully:", brokerResult);
        } catch (brokerError) {
          console.error("Error seeding broker data:", brokerError);
          // Continue with what we have
        }
        
        // Return whatever data we managed to seed
        res.json({ 
          success: true, 
          message: "Seed data process completed",
          data: { 
            vessels: vesselResult.vessels || 0,
            oilVessels: vesselResult.oilVessels || 0,
            totalCargo: vesselResult.totalCargo || 0,
            refineries: refineryResult.refineries || 0,
            active: refineryResult.active || 0,
            brokers: brokerResult.count || 0
          }
        });
      } catch (error) {
        console.error("Critical error in seed process:", error);
        res.status(500).json({ message: "Failed to seed data" });
      }
    });
    
    // Route to update refinery coordinates with accurate data
    apiRouter.post("/refineries/update-coordinates", async (req, res) => {
      try {
        console.log("Starting refinery coordinates update process...");
        
        // Update existing refineries with accurate coordinates
        const updateResult = await updateRefineryCoordinates();
        console.log("Refinery coordinates updated successfully:", updateResult);
        
        // Seed any missing refineries from the accurate dataset
        const seedResult = await seedMissingRefineries();
        console.log("Missing refineries added successfully:", seedResult);
        
        res.json({
          success: true,
          message: "Refinery coordinates updated successfully",
          data: {
            updated: updateResult.updated,
            total: updateResult.total,
            added: seedResult.added
          }
        });
      } catch (error) {
        console.error("Error updating refinery coordinates:", error);
        res.status(500).json({ message: "Failed to update refinery coordinates" });
      }
    });
  }

  // Stats endpoint
  apiRouter.get("/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      
      // Convert any BigInt values to numbers to avoid serialization issues
      if (stats) {
        const safeStats = {
          ...stats,
          id: Number(stats.id),
          activeVessels: Number(stats.activeVessels),
          totalCargo: Number(stats.totalCargo),
          activeRefineries: Number(stats.activeRefineries),
          activeBrokers: Number(stats.activeBrokers),
          lastUpdated: stats.lastUpdated
        };
        res.json(safeStats);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Vessel counts by region endpoint
  apiRouter.get("/stats/vessels-by-region", async (req, res) => {
    try {
      const result = await vesselService.getVesselCountsByRegion();
      
      // Get region names from constants
      const regionNames = REGIONS.reduce((acc: Record<string, string>, region) => {
        acc[region.id] = region.name; // Use name instead of nameEn
        return acc;
      }, {});
      
      // Format results
      const regionCountsArray = Object.entries(result.regionCounts).map(([region, count]) => ({
        region,
        regionName: regionNames[region] || region,
        count,
        percentage: (count / result.totalVessels * 100).toFixed(1),
        oilVesselCount: result.oilVesselRegionCounts[region] || 0
      })).sort((a, b) => b.count - a.count);
      
      res.json({
        totalVessels: result.totalVessels,
        totalOilVessels: result.totalOilVessels,
        regions: regionCountsArray
      });
    } catch (error: any) {
      console.error("Error fetching vessel counts by region:", error);
      res.status(500).json({ 
        message: "Failed to fetch vessel counts", 
        error: error.message 
      });
    }
  });

  // Marine Traffic API endpoints
  apiRouter.get("/vessels/marine-traffic", async (req, res) => {
    try {
      if (!marineTrafficService.isConfigured()) {
        return res.status(503).json({ 
          message: "Marine Traffic API is not configured. Please set MARINE_TRAFFIC_API_KEY environment variable." 
        });
      }
      
      const vessels = await marineTrafficService.fetchVessels();
      res.json(vessels);
    } catch (error) {
      console.error("Error fetching vessels from Marine Traffic:", error);
      res.status(500).json({ message: "Failed to fetch vessels from Marine Traffic API" });
    }
  });
  
  // Endpoint to get vessels near a refinery using Marine Traffic API
  apiRouter.get("/vessels/near-refinery/:id", async (req, res) => {
    try {
      const refineryId = parseInt(req.params.id);
      if (isNaN(refineryId)) {
        return res.status(400).json({ message: "Invalid refinery ID" });
      }
      
      // Get the refinery
      const refinery = await storage.getRefineryById(refineryId);
      if (!refinery) {
        return res.status(404).json({ message: "Refinery not found" });
      }
      
      // Try to fetch vessels from the database that are near this refinery
      // This calculates distance based on coordinates
      const allVessels = await storage.getVessels();
      
      // Parse refinery coordinates
      const refineryLat = typeof refinery.lat === 'number' 
        ? refinery.lat 
        : parseFloat(String(refinery.lat));
        
      const refineryLng = typeof refinery.lng === 'number'
        ? refinery.lng
        : parseFloat(String(refinery.lng));
      
      // Filter vessels that are within ~500km of the refinery
      const nearbyVessels = allVessels.filter(vessel => {
        if (!vessel.currentLat || !vessel.currentLng) return false;
        
        const vesselLat = typeof vessel.currentLat === 'number'
          ? vessel.currentLat
          : parseFloat(String(vessel.currentLat));
          
        const vesselLng = typeof vessel.currentLng === 'number'
          ? vessel.currentLng
          : parseFloat(String(vessel.currentLng));
          
        // Calculate approximate distance using a simple formula
        // This is a rough calculation, but good enough for this purpose
        const latDiff = Math.abs(vesselLat - refineryLat);
        const lngDiff = Math.abs(vesselLng - refineryLng);
        
        // Rough approximation for ~500km
        return (latDiff*latDiff + lngDiff*lngDiff) < 25;
      });
      
      res.json(nearbyVessels);
    } catch (error) {
      console.error(`Error fetching vessels near refinery:`, error);
      res.status(500).json({ message: "Failed to fetch vessels near refinery" });
    }
  });

  // Vessel endpoints
  apiRouter.get("/vessels", async (req, res) => {
    try {
      const region = req.query.region as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const vesselType = req.query.type as string | undefined;
      
      // Apply filters based on query parameters
      let vessels;
      if (region) {
        vessels = await vesselService.getVesselsByRegion(region);
      } else {
        vessels = await vesselService.getAllVessels();
      }
      
      // Apply vessel type filter if specified
      if (vesselType && vesselType !== 'all') {
        vessels = vessels.filter(v => 
          v.vesselType?.toLowerCase().includes(vesselType.toLowerCase())
        );
      }
      
      // Apply limit to reduce payload size if specified
      if (limit && limit > 0 && limit < vessels.length) {
        vessels = vessels.slice(0, limit);
      }
      
      res.json(vessels);
    } catch (error) {
      console.error("Error fetching vessels:", error);
      res.status(500).json({ message: "Failed to fetch vessels" });
    }
  });

  // API endpoint to get vessel region distribution statistics
  apiRouter.get("/vessels/distribution", async (req, res) => {
    try {
      // Get all vessels
      const vessels = await vesselService.getAllVessels();
      
      // Count vessels by region
      const regionCounts: Record<string, number> = {};
      vessels.forEach(vessel => {
        const region = vessel.currentRegion || 'unknown';
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      });
      
      // Count oil vessels
      const oilVessels = vessels.filter(vessel => {
        const cargoType = vessel.cargoType || '';
        return cargoType.toLowerCase().includes('crude') 
          || cargoType.toLowerCase().includes('oil')
          || cargoType.toLowerCase().includes('petroleum')
          || cargoType.toLowerCase().includes('gas')
          || cargoType.toLowerCase().includes('lng')
          || cargoType.toLowerCase().includes('diesel')
          || cargoType.toLowerCase().includes('fuel');
      });
      
      // Count oil vessels by region
      const oilVesselRegionCounts: Record<string, number> = {};
      oilVessels.forEach(vessel => {
        const region = vessel.currentRegion || 'unknown';
        oilVesselRegionCounts[region] = (oilVesselRegionCounts[region] || 0) + 1;
      });
      
      // Calculate total cargo capacity by region
      const cargoByRegion: Record<string, number> = {};
      vessels.forEach(vessel => {
        if (vessel.cargoCapacity && vessel.currentRegion) {
          const region = vessel.currentRegion;
          cargoByRegion[region] = (cargoByRegion[region] || 0) + Number(vessel.cargoCapacity);
        }
      });
      
      res.json({
        totalVessels: vessels.length,
        totalOilVessels: oilVessels.length,
        regionCounts,
        oilVesselRegionCounts,
        cargoByRegion
      });
    } catch (error) {
      console.error("Error fetching vessel distribution:", error);
      res.status(500).json({ message: "Failed to fetch vessel distribution" });
    }
  });

  apiRouter.get("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vessel ID" });
      }
      
      const vessel = await storage.getVesselById(id);
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      res.json(vessel);
    } catch (error) {
      console.error("Error fetching vessel:", error);
      res.status(500).json({ message: "Failed to fetch vessel" });
    }
  });

  // SSE endpoint for real-time data
  apiRouter.get("/stream/data", (req, res) => {
    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    
    // Send initial event to establish connection
    res.write("event: connected\n");
    res.write(`data: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
    
    // Function to send data
    const sendData = async (initial: boolean = true) => {
      try {
        // Get current data
        const vessels = await storage.getVessels();
        const refineries = await storage.getRefineries();
        
        // Filter vessels (optional)
        const filteredVessels = vessels
          .filter(v => v.vesselType?.toLowerCase().includes('cargo') || false)
          .slice(0, 500);
        
        // Send vessel data
        res.write("event: vessels\n");
        res.write(`data: ${JSON.stringify(filteredVessels)}\n\n`);
        
        // Send refinery data
        res.write("event: refineries\n");
        res.write(`data: ${JSON.stringify(refineries)}\n\n`);
        
        // Get and send stats
        const statsData = await storage.getStats();
        if (statsData) {
          res.write("event: stats\n");
          res.write(`data: ${JSON.stringify(statsData)}\n\n`);
        }
        
      } catch (error) {
        console.error("Error sending SSE data:", error);
        res.write("event: error\n");
        res.write(`data: ${JSON.stringify({ message: "Error fetching data" })}\n\n`);
      }
    };
    
    // Send initial data
    sendData(true);
    
    // Set up interval to send data periodically
    const intervalId = setInterval(() => sendData(false), 5000);
    
    // Handle client disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  });

  apiRouter.post("/vessels", async (req, res) => {
    try {
      const vesselData = insertVesselSchema.parse(req.body);
      const vessel = await storage.createVessel(vesselData);
      res.status(201).json(vessel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid vessel data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error creating vessel:", error);
      res.status(500).json({ message: "Failed to create vessel" });
    }
  });

  apiRouter.patch("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vessel ID" });
      }
      
      // Allow partial updates with a subset of vessel fields
      const vesselUpdate = req.body;
      const updatedVessel = await storage.updateVessel(id, vesselUpdate);
      
      if (!updatedVessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      res.json(updatedVessel);
    } catch (error) {
      console.error("Error updating vessel:", error);
      res.status(500).json({ message: "Failed to update vessel" });
    }
  });

  apiRouter.delete("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vessel ID" });
      }
      
      const deleted = await storage.deleteVessel(id);
      if (!deleted) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vessel:", error);
      res.status(500).json({ message: "Failed to delete vessel" });
    }
  });

  // Endpoint to move vessels to random positions for demo
  apiRouter.post("/vessels/randomize-positions", async (req, res) => {
    try {
      console.log("Randomizing vessel positions...");
      const vessels = await storage.getVessels();
      let updatedCount = 0;
      
      for (const vessel of vessels) {
        // Skip vessels with no ID (shouldn't happen but just in case)
        if (!vessel.id) continue;
        
        // Generate random coordinates
        const lat = (Math.random() * 180 - 90).toFixed(6);
        const lng = (Math.random() * 360 - 180).toFixed(6);
        
        // Update the vessel position
        await storage.updateVessel(vessel.id, {
          currentLat: lat,
          currentLng: lng
        });
        
        updatedCount++;
      }
      
      res.json({
        success: true,
        updatedVessels: updatedCount,
        message: `${updatedCount} vessels have been moved to random positions`
      });
    } catch (error) {
      console.error("Error randomizing vessel positions:", error);
      res.status(500).json({ message: "Failed to randomize vessel positions" });
    }
  });

  // Refinery endpoints
  apiRouter.get("/refineries", async (req, res) => {
    try {
      const region = req.query.region as string | undefined;
      
      // Apply filters based on query parameters
      let refineries;
      if (region) {
        refineries = await storage.getRefineryByRegion(region);
      } else {
        refineries = await storage.getRefineries();
      }
      
      res.json(refineries);
    } catch (error) {
      console.error("Error fetching refineries:", error);
      res.status(500).json({ message: "Failed to fetch refineries" });
    }
  });

  apiRouter.get("/refineries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid refinery ID" });
      }
      
      const refinery = await storage.getRefineryById(id);
      if (!refinery) {
        return res.status(404).json({ message: "Refinery not found" });
      }
      
      res.json(refinery);
    } catch (error) {
      console.error("Error fetching refinery:", error);
      res.status(500).json({ message: "Failed to fetch refinery" });
    }
  });

  // Get vessels associated with a refinery (within proximity)
  apiRouter.get("/refineries/:id/vessels", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid refinery ID" });
      }
      
      // Get the refinery
      const refinery = await storage.getRefineryById(id);
      if (!refinery) {
        return res.status(404).json({ message: "Refinery not found" });
      }
      
      // Get all vessels
      const vessels = await storage.getVessels();
      
      // Find vessels within proximity
      const SEARCH_RADIUS_KM = 500;  // Increased radius for better results
      
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c;
      };
      
      // Parse refinery coordinates
      const refineryLat = parseFloat(refinery.lat);
      const refineryLng = parseFloat(refinery.lng);
      
      // Find vessels within radius
      const allConnected = vessels.filter(vessel => {
        // Parse vessel coordinates, skipping any with invalid coordinates
        const vesselLat = parseFloat(vessel.currentLat || '0');
        const vesselLng = parseFloat(vessel.currentLng || '0');
        
        // Skip vessels with invalid coordinates
        if (isNaN(vesselLat) || isNaN(vesselLng) || 
            (vesselLat === 0 && vesselLng === 0)) {
          return false;
        }
        
        // Calculate distance
        const distance = calculateDistance(
          refineryLat, refineryLng, 
          vesselLat, vesselLng
        );
        
        // Include vessels within the radius
        return distance <= SEARCH_RADIUS_KM;
      });
      
      // Ensure unique vessels only
      const uniqueIds = new Set();
      const uniqueVessels = allConnected.filter(vessel => {
        if (uniqueIds.has(vessel.id)) return false;
        uniqueIds.add(vessel.id);
        return true;
      });
      
      // Return the associated vessels (limit to 20 vessels max)
      res.json(uniqueVessels.slice(0, 20));
    } catch (error) {
      console.error("Error fetching vessels for refinery:", error);
      res.status(500).json({ message: "Failed to fetch vessels for refinery" });
    }
  });

  apiRouter.post("/refineries", async (req, res) => {
    try {
      const refineryData = insertRefinerySchema.parse(req.body);
      const refinery = await refineryService.createRefinery(refineryData);
      res.status(201).json(refinery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid refinery data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error creating refinery:", error);
      res.status(500).json({ message: "Failed to create refinery" });
    }
  });

  // Document endpoints
  apiRouter.get("/documents", async (req, res) => {
    try {
      const vesselId = req.query.vesselId ? parseInt(req.query.vesselId as string) : undefined;
      
      if (vesselId) {
        const documents = await storage.getDocumentsByVesselId(vesselId);
        res.json(documents);
      } else {
        const documents = await storage.getDocuments();
        res.json(documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  apiRouter.post("/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid document data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Endpoint to generate a document with Cohere AI
  apiRouter.post("/documents/generate", async (req, res) => {
    try {
      const { vesselId, documentType } = req.body;
      
      if (!vesselId || !documentType) {
        return res.status(400).json({ 
          message: "Missing required fields: vesselId and documentType are required" 
        });
      }
      
      // Get the vessel details
      const vessel = await storage.getVesselById(parseInt(vesselId));
      
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      // Generate the document using AI
      const generatedDocument = await aiService.generateShippingDocument(vessel, documentType);
      
      res.json(generatedDocument);
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ 
        message: "Failed to generate document", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Broker endpoints
  apiRouter.get("/brokers", async (req, res) => {
    try {
      const brokers = await brokerService.getBrokers();
      res.json(brokers);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      res.status(500).json({ message: "Failed to fetch brokers" });
    }
  });

  apiRouter.get("/brokers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid broker ID" });
      }
      
      const broker = await brokerService.getBrokerById(id);
      if (!broker) {
        return res.status(404).json({ message: "Broker not found" });
      }
      
      res.json(broker);
    } catch (error) {
      console.error("Error fetching broker:", error);
      res.status(500).json({ message: "Failed to fetch broker" });
    }
  });

  apiRouter.post("/brokers", async (req, res) => {
    try {
      const brokerData = insertBrokerSchema.parse(req.body);
      const broker = await brokerService.createBroker(brokerData);
      res.status(201).json(broker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid broker data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error creating broker:", error);
      res.status(500).json({ message: "Failed to create broker" });
    }
  });

  // Elite membership endpoints
  apiRouter.post("/brokers/:id/upgrade", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid broker ID" });
      }
      
      // Get the membership duration and level from the request
      const { duration, level } = req.body;
      
      if (!duration || !level) {
        return res.status(400).json({ 
          message: "Missing required fields: duration and level are required" 
        });
      }
      
      // Upgrade the broker to elite membership
      const result = await brokerService.upgradeToBrokerElite(id, duration, level);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({
        success: true,
        message: `Broker has been upgraded to Elite ${level} for ${duration} months`,
        broker: result.broker
      });
    } catch (error) {
      console.error("Error upgrading broker:", error);
      res.status(500).json({ message: "Failed to upgrade broker" });
    }
  });
  
  apiRouter.post("/brokers/:id/check-elite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid broker ID" });
      }
      
      const isElite = await brokerService.checkEliteMembership(id);
      
      res.json({
        id,
        isElite,
        message: isElite 
          ? "Broker has an active Elite membership" 
          : "Broker does not have an active Elite membership"
      });
    } catch (error) {
      console.error("Error checking elite status:", error);
      res.status(500).json({ message: "Failed to check elite status" });
    }
  });

  // Stripe payment endpoints
  apiRouter.post("/payment/create-intent", async (req, res) => {
    try {
      const { amount, currency = "usd" } = req.body;
      
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const paymentIntent = await stripeService.createPaymentIntent(amount, currency);
      
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Failed to create payment intent",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // API routes for vessel distribution data
  app.use("/api/distribution", vesselDistributionRouter);
  
  // API routes for trading data
  app.use("/api/trading", tradingRouter);
  
  // API routes for broker-related operations
  app.use("/api/broker", brokerRouter);

  // API tester routes (performance testing, etc.)
  app.use("/api/tester", apiTesterRouter);

  // Mount API router for general endpoints
  app.use("/api", apiRouter);

  const httpServer = createServer(app);

  return httpServer;
}