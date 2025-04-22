import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vesselService } from "./services/vesselService";
import { refineryService } from "./services/refineryService";
import { aiService } from "./services/aiService";
import { dataService } from "./services/asiStreamService";
import { brokerService } from "./services/brokerService";
import { stripeService } from "./services/stripeService";
import { updateRefineryCoordinates, seedMissingRefineries } from "./services/refineryUpdate";
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

  apiRouter.get("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vessel = await vesselService.getVesselById(id);
      
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      res.json(vessel);
    } catch (error) {
      console.error("Error fetching vessel:", error);
      res.status(500).json({ message: "Failed to fetch vessel" });
    }
  });

  apiRouter.post("/vessels", async (req, res) => {
    try {
      const vesselData = insertVesselSchema.parse(req.body);
      const vessel = await vesselService.createVessel(vesselData);
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

  apiRouter.put("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vesselData = insertVesselSchema.partial().parse(req.body);
      const vessel = await vesselService.updateVessel(id, vesselData);
      
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      res.json(vessel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid vessel data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error updating vessel:", error);
      res.status(500).json({ message: "Failed to update vessel" });
    }
  });

  apiRouter.delete("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await vesselService.deleteVessel(id);
      
      if (!success) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vessel:", error);
      res.status(500).json({ message: "Failed to delete vessel" });
    }
  });

  // Rebuild vessel regions with accurate classification
  apiRouter.post("/vessels/rebuild-regions", async (req, res) => {
    try {
      console.log("Starting vessel region classification rebuild...");
      // Get all existing vessels
      const vessels = await vesselService.getAllVessels();
      console.log(`Found ${vessels.length} vessels to update regions.`);
      
      // Update each vessel's region based on coordinates
      let updatedCount = 0;
      const { determineRegionFromCoordinates } = await import('./services/vesselGenerator');
      
      for (const vessel of vessels) {
        // Handle potential null values
        const lat = vessel.currentLat ? parseFloat(vessel.currentLat) : null;
        const lng = vessel.currentLng ? parseFloat(vessel.currentLng) : null;
        
        if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
          const mappedRegion = determineRegionFromCoordinates(lat, lng);
          
          // Only update if region changed
          if (vessel.currentRegion !== mappedRegion) {
            await vesselService.updateVessel(vessel.id, { currentRegion: mappedRegion });
            updatedCount++;
          }
        }
      }
      
      res.json({
        success: true,
        message: `Vessel regions updated successfully: ${updatedCount} of ${vessels.length} updated`
      });
    } catch (error: any) {
      console.error("Error rebuilding vessel regions:", error);
      res.status(500).json({
        success: false,
        message: "Error updating vessel regions",
        error: error.message || "Unknown error"
      });
    }
  });

  // Progress events endpoints
  apiRouter.get("/vessels/:id/progress", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      const events = await vesselService.getVesselProgressEvents(vesselId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching progress events:", error);
      res.status(500).json({ message: "Failed to fetch progress events" });
    }
  });

  apiRouter.post("/vessels/:id/progress", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      
      // Check if vessel exists
      const vessel = await vesselService.getVesselById(vesselId);
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      const eventData = insertProgressEventSchema.parse({
        ...req.body,
        vesselId
      });
      
      const event = await vesselService.addProgressEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid progress event data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error creating progress event:", error);
      res.status(500).json({ message: "Failed to create progress event" });
    }
  });
  
  // Update vessel location with accurate coordinates
  apiRouter.post("/vessels/:id/update-location", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      const { lat, lng, eventDescription, destinationRefineryId, destinationPort } = req.body;
      
      // Validate inputs
      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        return res.status(400).json({
          success: false,
          message: "Invalid coordinates provided. Both lat and lng must be valid numbers."
        });
      }
      
      // Convert to numbers and validate ranges
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: "Coordinates out of range. Latitude must be between -90 and 90, longitude between -180 and 180."
        });
      }
      
      // Get the vessel to make sure it exists
      const vessel = await vesselService.getVesselById(vesselId);
      if (!vessel) {
        return res.status(404).json({
          success: false,
          message: "Vessel not found"
        });
      }
      
      // Get destination refinery information if provided
      let destinationRefineryName = null;
      if (destinationRefineryId) {
        const destinationRefinery = await refineryService.getRefineryById(parseInt(destinationRefineryId));
        if (destinationRefinery) {
          destinationRefineryName = destinationRefinery.name;
        }
      }
      
      // Import function to determine region from coordinates
      const { determineRegionFromCoordinates } = await import('./services/vesselGenerator');
      const newRegion = determineRegionFromCoordinates(latitude, longitude);
      
      // Prepare vessel update data
      const vesselUpdateData: any = {
        currentLat: latitude.toString(),
        currentLng: longitude.toString(),
        currentRegion: newRegion
      };
      
      // Add destination information if provided
      if (destinationRefineryId) {
        vesselUpdateData.destinationRefineryId = parseInt(destinationRefineryId);
        if (destinationRefineryName) {
          vesselUpdateData.destinationPort = destinationRefineryName;
        }
      } else if (destinationPort) {
        vesselUpdateData.destinationPort = destinationPort;
        // Clear any previous refinery destination if only port is provided
        vesselUpdateData.destinationRefineryId = null;
      }
      
      // Update vessel location and destination
      const updatedVessel = await vesselService.updateVessel(vesselId, vesselUpdateData);
      
      // Format destination information for event description
      let destinationInfo = "At sea";
      if (destinationRefineryName) {
        destinationInfo = `Refinery: ${destinationRefineryName}`;
      } else if (destinationPort) {
        destinationInfo = `Port: ${destinationPort}`;
      } else if (vessel.destinationPort) {
        destinationInfo = vessel.destinationPort;
      }
      
      // Create progress event if there's a description
      if (eventDescription) {
        await vesselService.addProgressEvent({
          vesselId,
          date: new Date(),
          event: eventDescription,
          lat: latitude.toString(),
          lng: longitude.toString(),
          location: destinationInfo
        });
      }
      
      // Add destination change event if destination has changed
      const destRefId = destinationRefineryId ? parseInt(destinationRefineryId) : null;
      const vesselDestRefId = vessel.destinationRefineryId || null;
      
      if ((destinationRefineryId && vesselDestRefId !== destRefId) || 
          (destinationPort && vessel.destinationPort !== destinationPort)) {
        await vesselService.addProgressEvent({
          vesselId,
          date: new Date(),
          event: `Destination changed to ${destinationInfo}`,
          lat: latitude.toString(),
          lng: longitude.toString(),
          location: destinationInfo
        });
      }
      
      res.json({
        success: true,
        message: "Vessel location updated successfully",
        vessel: updatedVessel,
        region: newRegion,
        destination: destinationInfo
      });
    } catch (error: any) {
      console.error("Error updating vessel location:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update vessel location",
        error: error.message
      });
    }
  });

  // Refinery endpoints
  apiRouter.get("/refineries", async (req, res) => {
    try {
      const region = req.query.region as string | undefined;
      
      if (region) {
        const refineries = await refineryService.getRefineryByRegion(region);
        res.json(refineries);
      } else {
        const refineries = await refineryService.getAllRefineries();
        res.json(refineries);
      }
    } catch (error) {
      console.error("Error fetching refineries:", error);
      res.status(500).json({ message: "Failed to fetch refineries" });
    }
  });

  apiRouter.get("/refineries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const refinery = await refineryService.getRefineryById(id);
      
      if (!refinery) {
        return res.status(404).json({ message: "Refinery not found" });
      }
      
      res.json(refinery);
    } catch (error) {
      console.error("Error fetching refinery:", error);
      res.status(500).json({ message: "Failed to fetch refinery" });
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

  // AI Assistant endpoints
  apiRouter.post("/ai/query", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const result = await aiService.processQuery(query);
      res.json(result);
    } catch (error) {
      console.error("Error processing AI query:", error);
      res.status(500).json({ message: "Failed to process query" });
    }
  });

  apiRouter.post("/ai/generate-document", async (req, res) => {
    try {
      const { vesselId, documentType } = req.body;
      
      if (!vesselId || !documentType) {
        return res.status(400).json({ message: "vesselId and documentType are required" });
      }
      
      const document = await aiService.generateDocument(vesselId, documentType);
      res.json(document);
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  // Broker endpoints
  apiRouter.get("/brokers", async (req, res) => {
    try {
      const brokers = await storage.getBrokers();
      res.json(brokers);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      res.status(500).json({ message: "Failed to fetch brokers" });
    }
  });

  apiRouter.post("/brokers", async (req, res) => {
    try {
      const brokerData = insertBrokerSchema.parse(req.body);
      const broker = await storage.createBroker(brokerData);
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

  // Stream API endpoints - Optimized for database first approach
  apiRouter.get("/stream/data", (req, res) => {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Keep track of last update time to reduce database queries
    let lastDbFetchTime = 0;
    const DB_REFRESH_INTERVAL = 30000; // 30 seconds - refresh database data
    const POSITION_UPDATE_INTERVAL = 5000; // 5 seconds - update positions more frequently
    
    // Cache the data to reduce database load
    let cachedVessels: Vessel[] = [];
    let cachedRefineries: Refinery[] = [];
    let cachedStats: any = null;
    
    // Main data sending function
    const sendData = async (forceDbRefresh = false) => {
      try {
        const currentTime = Date.now();
        const shouldRefreshDb = forceDbRefresh || (currentTime - lastDbFetchTime > DB_REFRESH_INTERVAL);
        
        // --- OPTIMIZED DATABASE-FIRST APPROACH ---
        if (shouldRefreshDb) {
          console.log("Refreshing data from database...");
          lastDbFetchTime = currentTime;
          
          // Step 1: Get optimized data from database (limit to most relevant vessels)
          const MAX_VESSELS_PER_RESPONSE = 350; // Reduced for better performance
          
          // Get vessels (limited for better performance)
          let vessels = await vesselService.getAllVessels();
          
          // Filter for oil vessels specifically to make the app smoother
          const isOilVessel = (v: Vessel) => {
            if (!v.vesselType) return false;
            const type = v.vesselType.toLowerCase();
            return (
              type.includes('oil') ||
              type.includes('tanker') ||
              type.includes('crude') ||
              type.includes('vlcc')
            );
          };
          
          // Prioritize vessels:
          // 1. Only oil vessels (most important to show)
          // 2. Only vessels with current location data
          // 3. Limited for better performance
          vessels = vessels
            .filter(v => v.currentLat && v.currentLng && isOilVessel(v))
            .slice(0, MAX_VESSELS_PER_RESPONSE);
          
          // Update the cache
          cachedVessels = vessels;
          
          // Step 2: Get all refineries (there are fewer refineries, so we can get all)
          cachedRefineries = await refineryService.getAllRefineries();
          
          // Get updated stats
          const stats = await storage.getStats();
          if (stats) {
            // Convert BigInt values to numbers
            cachedStats = {
              ...stats,
              id: Number(stats.id),
              activeVessels: Number(stats.activeVessels),
              totalCargo: Number(stats.totalCargo),
              activeRefineries: Number(stats.activeRefineries),
              activeBrokers: Number(stats.activeBrokers),
              lastUpdated: stats.lastUpdated
            };
          }
        }
        
        // Step 3: Send optimized data to client from cache
        res.write(`event: vessels\n`);
        res.write(`data: ${JSON.stringify(cachedVessels)}\n\n`);
        
        res.write(`event: refineries\n`);
        res.write(`data: ${JSON.stringify(cachedRefineries)}\n\n`);
        
        if (cachedStats) {
          res.write(`event: stats\n`);
          res.write(`data: ${JSON.stringify(cachedStats)}\n\n`);
        }
        
        // Step 4: Update positions in background (no need to wait)
        // This runs asynchronously and updates the vessel positions in cache
        if (currentTime - lastDbFetchTime > POSITION_UPDATE_INTERVAL) {
          setTimeout(async () => {
            try {
              // Get position updates from database, no longer using API
              const positionUpdates = await dataService.fetchVessels();
              
              // Map of IMO -> position updates for fast lookup
              const positionMap = new Map();
              positionUpdates.forEach(vessel => {
                if (vessel.imo && vessel.currentLat && vessel.currentLng) {
                  positionMap.set(vessel.imo, {
                    currentLat: vessel.currentLat,
                    currentLng: vessel.currentLng,
                    eta: vessel.eta,
                    destinationPort: vessel.destinationPort
                  });
                }
              });
              
              // Update cached vessels with new positions
              cachedVessels = cachedVessels.map(vessel => {
                const update = positionMap.get(vessel.imo);
                if (update) {
                  return { ...vessel, ...update };
                }
                return vessel;
              });
              
              // Batch update vessels in database (in background)
              for (const vessel of cachedVessels) {
                const update = positionMap.get(vessel.imo);
                if (update) {
                  // Don't wait for this to complete
                  vesselService.updateVessel(vessel.id, update)
                    .catch(err => console.error(`Error updating vessel ${vessel.id}:`, err));
                }
              }
            } catch (updateError) {
              console.error("Error updating vessel positions from database:", updateError);
            }
          }, 100); // Run quickly after sending data to update positions
        }
        
        // Send a heartbeat to keep the connection alive
        res.write(`event: heartbeat\n`);
        res.write(`data: ${Date.now()}\n\n`);
      } catch (error) {
        console.error("Error streaming data:", error);
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ message: "Error fetching data" })}\n\n`);
      }
    };
    
    // Send initial data with full DB refresh
    sendData(true);
    
    // Send position updates more frequently, with DB refresh every 30 seconds
    const intervalId = setInterval(() => sendData(false), 5000);
    
    // Handle client disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  });
  
  // Mount API tester routes for testing large datasets
  apiRouter.use("/test", apiTesterRouter);
  
  // Mount broker routes
  apiRouter.use("/brokers", brokerRouter);
  
  // Payment and subscription endpoints are defined below with middleware protection

  // Stripe webhook endpoint
  app.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'] as string;
    
    try {
      // Make sure we have the necessary values
      if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ message: "Stripe signature or webhook secret missing" });
      }
      
      // Parse and validate the webhook event
      const event = await stripeService.parseWebhookEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      // Handle the event
      await stripeService.handleWebhookEvent(event);
      
      res.json({ received: true });
    } catch (error: any) {
      console.error("Webhook Error:", error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });
  
  // Stripe payment endpoints - protected with authentication
  apiRouter.post("/create-payment-intent", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }, async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || isNaN(amount)) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const result = await stripeService.createPaymentIntent(amount);
      res.json(result);
    } catch (error: any) {
      console.error("Payment intent error:", error);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });
  
  apiRouter.post("/get-or-create-subscription", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }, async (req, res) => {
    try {
      // Use PRICE_ID from environment or a default price ID from request
      const priceId = process.env.STRIPE_PRICE_ID || req.body.priceId;
      
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }
      
      const userId = req.user!.id;
      const result = await stripeService.getOrCreateSubscription(userId, priceId);
      res.json(result);
    } catch (error: any) {
      console.error("Subscription error:", error);
      res.status(500).json({ message: error.message || "Failed to process subscription" });
    }
  });
  
  apiRouter.post("/cancel-subscription", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }, async (req, res) => {
    try {
      const userId = req.user!.id;
      const result = await stripeService.cancelSubscription(userId);
      res.json(result);
    } catch (error: any) {
      console.error("Subscription cancellation error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel subscription" });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}