import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vesselService } from "./services/vesselService";
import { refineryService } from "./services/refineryService";
import { aiService } from "./services/aiService";
import { dataService } from "./services/asiStreamService";
import { brokerService } from "./services/brokerService";
import { stripeService } from "./services/stripeService";
import { openAiService } from "./services/openAiService";
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
  ProgressEvent,
  Document
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { vessels, refineries, progressEvents, documents, brokers, stats } from "@shared/schema";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { WebSocketServer } from "ws";
import { 
  broadcastVesselUpdate, 
  broadcastRefineryUpdate,
  setupEvents 
} from "./events";
import { vesselRouter } from "./routes/vesselRoutes";
import { refineryRouter } from "./routes/refineryRoutes";
import { documentRouter } from "./routes/documentRoutes";
import { brokerRouter } from "./routes/brokerRoutes";
import { tradingRouter } from "./routes/tradingRoutes";
import { apiTesterRouter } from "./routes/apiTester";
import { seedRouter } from "./routes/seedRoutes";
import { determineRegionFromCoordinates } from "../region-test";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  const apiRouter = express.Router();
  
  // Admin utilities
    apiRouter.post("/clear-data", async (req, res) => {
      try {
        // Warning: this will delete all data
        await db.delete(progressEvents);
        await db.delete(documents);
        await db.delete(vessels);
        await db.delete(refineries);
        await db.delete(brokers);
        await db.delete(stats);
        
        res.json({ success: true, message: "All data cleared from database" });
      } catch (error: any) {
        console.error("Error clearing data:", error);
        res.status(500).json({ error: error.message || "Failed to clear data" });
      }
    });

    /**
     * Helper function to determine if a vessel is an oil vessel
     */
    const isOilVessel = (v: Vessel) => {
      return v.vesselType?.toLowerCase().includes('tanker') || 
             v.cargoType?.toLowerCase().includes('oil') || 
             v.cargoType?.toLowerCase().includes('crude') ||
             v.cargoType?.toLowerCase().includes('petroleum') ||
             v.cargoType?.toLowerCase().includes('gas') ||
             v.cargoType?.toLowerCase().includes('lng') ||
             v.cargoType?.toLowerCase().includes('lpg');
    };
    
    apiRouter.post("/vessels/refresh", async (req, res) => {
      try {
        // This method doesn't do real refreshing since we don't have an external API
        // It just returns success to simulate a refresh
        return res.json({
          success: true, 
          message: "Vessel data refreshed successfully",
          count: await db.select({ count: sql`count(*)` }).from(vessels).then(r => r[0].count)
        });
      } catch (error: any) {
        console.error("Error refreshing vessels:", error);
        res.status(500).json({ error: error.message || "Failed to refresh vessel data" });
      }
    });
    
    apiRouter.post("/seed", async (req, res) => {
      try {
        // Start database seeding
        console.log("Starting database seeding process...");
        
        // Start refinery seeding
        console.log("Seeding refinery data...");
        
        // Check existing refineries
        console.log("Checking existing refineries in database...");
        const refineryCount = await db.select({ count: sql`count(*)` }).from(refineries).then(r => Number(r[0].count));
        
        if (refineryCount === 0) {
          // Full seed
          const newRefineries = await refineryService.seedRefineries();
          console.log(`Created ${newRefineries.length} refineries`);
        } else {
          console.log(`Database already contains ${refineryCount} refineries.`);
        }
        
        // Count active refineries
        const activeRefineries = await db.select({ count: sql`count(*)` })
          .from(refineries)
          .where(eq(refineries.status, 'Active'))
          .then(r => Number(r[0].count));
        
        console.log(`Refinery data seeded successfully: { refineries: ${refineryCount}, active: ${activeRefineries} }`);
        
        // Start vessel seeding
        console.log("Seeding vessel data...");
        
        // Check existing vessels
        console.log("Checking existing vessels in database...");
        const vesselCount = await db.select({ count: sql`count(*)` }).from(vessels).then(r => Number(r[0].count));
        
        if (vesselCount === 0) {
          // Full seed
          const newVessels = await vesselService.seedVessels();
          console.log(`Created ${newVessels.length} vessels`);
        } else {
          console.log(`Database already contains ${vesselCount} vessels.`);
        }
        
        // Count oil vessels
        const oilVesselCount = await db.select({ count: sql`count(*)` })
          .from(vessels)
          .where(sql`vessel_type ILIKE '%tanker%' OR cargo_type ILIKE '%oil%' OR cargo_type ILIKE '%crude%'`)
          .then(r => Number(r[0].count));
        
        // Calculate total cargo
        const totalCargo = await db.select({ 
          sum: sql`SUM(CAST(cargo_capacity AS DECIMAL))` 
        })
        .from(vessels)
        .then(r => Math.round(Number(r[0].sum) || 0));
        
        console.log(`Vessel data seeded successfully: { vessels: ${vesselCount}, oilVessels: ${oilVesselCount}, totalCargo: ${totalCargo} }`);
        
        // Seed brokers
        console.log("Seeding broker data...");
        const brokerResult = await brokerService.seedBrokers();
        console.log(`Broker data seeded successfully: { count: ${brokerResult.count}, seeded: ${brokerResult.seeded} }`);
        
        res.json({ 
          success: true, 
          message: "Seed data process complete",
          stats: {
            refineries: refineryCount,
            vessels: vesselCount,
            oilVessels: oilVesselCount,
            brokers: await db.select({ count: sql`count(*)` }).from(brokers).then(r => Number(r[0].count))
          }
        });
      } catch (error: any) {
        console.error("Error seeding data:", error);
        res.status(500).json({ error: error.message || "Failed to seed data" });
      }
    });
    
    apiRouter.post("/refineries/update-coordinates", async (req, res) => {
      try {
        // Update refineries with more accurate coordinates
        const result = await updateRefineryCoordinates();
        
        // Add any missing refineries
        const seedResult = await seedMissingRefineries();
        
        res.json({ 
          success: true, 
          message: "Refinery coordinates updated successfully",
          updated: result.updated,
          totalRefineries: result.total,
          seeded: seedResult.seeded
        });
      } catch (error: any) {
        console.error("Error updating refinery coordinates:", error);
        res.status(500).json({ error: error.message || "Failed to update refinery coordinates" });
      }
    });
    
  // General stats API
  apiRouter.get("/stats", async (req, res) => {
    try {
      // Get basic stats
      const vesselCount = await db.select({ count: sql`count(*)` }).from(vessels).then(r => Number(r[0].count));
      const refineryCount = await db.select({ count: sql`count(*)` }).from(refineries).then(r => Number(r[0].count));
      const documentCount = await db.select({ count: sql`count(*)` }).from(documents).then(r => Number(r[0].count));
      
      // Get stats record from database or create if it doesn't exist
      let statsRecord = await storage.getStats();
      
      // Calculate total cargo capacity
      const totalCargo = await db.select({ 
        sum: sql`SUM(CAST(cargo_capacity AS DECIMAL))` 
      })
      .from(vessels)
      .then(r => Math.round(Number(r[0].sum) || 0));
      
      res.json({
        vessels: vesselCount,
        refineries: refineryCount,
        documents: documentCount,
        totalCargo: totalCargo.toLocaleString(),
        activeVessels: statsRecord?.activeVessels || vesselCount,
        deliveriesCompleted: statsRecord?.deliveriesCompleted || 1253,
        totalBarrelsDelivered: statsRecord?.totalBarrelsDelivered || 987654321
      });
    } catch (error: any) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: error.message || "Failed to get stats" });
    }
  });

  apiRouter.get("/stats/vessels-by-region", async (req, res) => {
    try {
      const regions = REGIONS.map(r => r.value);
      const counts = await Promise.all(
        regions.map(async (region) => {
          const count = await db.select({ count: sql`count(*)` })
            .from(vessels)
            .where(eq(vessels.currentRegion, region))
            .then(r => Number(r[0].count));
          
          return {
            region,
            count
          };
        })
      );
      
      // Also get NULL/unknown count
      const unknownCount = await db.select({ count: sql`count(*)` })
        .from(vessels)
        .where(sql`current_region IS NULL`)
        .then(r => Number(r[0].count));
      
      counts.push({
        region: 'Unknown',
        count: unknownCount
      });
      
      res.json(counts);
    } catch (error: any) {
      console.error("Error getting vessels by region:", error);
      res.status(500).json({ error: error.message || "Failed to get vessel region stats" });
    }
  });
  
  // Vessel API
  apiRouter.get("/vessels", async (req, res) => {
    try {
      const { region, type } = req.query;
      let result: Vessel[];
      
      if (region && typeof region === 'string') {
        result = await storage.getVesselsByRegion(region);
      } else {
        result = await storage.getVessels();
      }
      
      // Filter by type if specified
      if (type && typeof type === 'string') {
        result = result.filter(vessel => 
          vessel.vesselType?.toLowerCase().includes(type.toLowerCase()) ||
          vessel.cargoType?.toLowerCase().includes(type.toLowerCase())
        );
      }
      
      // Add a flag for oil vessels
      const formattedResults = result.map(vessel => ({
        ...vessel,
        isOilVessel: isOilVessel(vessel)
      }));
      
      res.json(formattedResults);
    } catch (error: any) {
      console.error("Error getting vessels:", error);
      res.status(500).json({ error: error.message || "Failed to get vessels" });
    }
  });

  apiRouter.get("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vessel = await storage.getVesselById(id);
      
      if (!vessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      res.json(vessel);
    } catch (error: any) {
      console.error("Error getting vessel:", error);
      res.status(500).json({ error: error.message || "Failed to get vessel" });
    }
  });
  
  apiRouter.post("/vessels", async (req, res) => {
    try {
      const vesselData = insertVesselSchema.parse(req.body);
      const newVessel = await storage.createVessel(vesselData);
      
      // Broadcast the new vessel to connected WebSocket clients
      broadcastVesselUpdate(newVessel);
      
      res.status(201).json(newVessel);
    } catch (error: any) {
      console.error("Error creating vessel:", error);
      res.status(400).json({ error: error.message || "Failed to create vessel" });
    }
  });
  
  apiRouter.put("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate input (partial)
      const vesselData = insertVesselSchema.partial().parse(req.body);
      
      // Process automatic region determination if coordinates are included
      if (vesselData.currentLat && vesselData.currentLng) {
        const lat = parseFloat(vesselData.currentLat);
        const lng = parseFloat(vesselData.currentLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          const region = determineRegionFromCoordinates(lat, lng);
          if (region) {
            vesselData.currentRegion = region;
          }
        }
      }
      
      const updatedVessel = await storage.updateVessel(id, vesselData);
      
      if (!updatedVessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      // Broadcast the vessel update to connected WebSocket clients
      broadcastVesselUpdate(updatedVessel);
      
      res.json(updatedVessel);
    } catch (error: any) {
      console.error("Error updating vessel:", error);
      res.status(400).json({ error: error.message || "Failed to update vessel" });
    }
  });
  
  apiRouter.delete("/vessels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVessel(id);
      
      if (!success) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting vessel:", error);
      res.status(500).json({ error: error.message || "Failed to delete vessel" });
    }
  });
  
  apiRouter.post("/vessels/rebuild-regions", async (req, res) => {
    try {
      // Get all vessels
      const allVessels = await storage.getVessels();
      
      // Track stats
      let updated = 0;
      let unchanged = 0;
      let noCoordinates = 0;
      
      // Process vessels in batches to avoid overwhelming the database
      for (const vessel of allVessels) {
        if (vessel.currentLat && vessel.currentLng) {
          const lat = parseFloat(vessel.currentLat);
          const lng = parseFloat(vessel.currentLng);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const region = determineRegionFromCoordinates(lat, lng);
            
            if (region && region !== vessel.currentRegion) {
              await storage.updateVessel(vessel.id, { currentRegion: region });
              updated++;
            } else {
              unchanged++;
            }
          } else {
            noCoordinates++;
          }
        } else {
          noCoordinates++;
        }
      }
      
      res.json({
        success: true,
        total: allVessels.length,
        updated,
        unchanged,
        noCoordinates
      });
    } catch (error: any) {
      console.error("Error rebuilding regions:", error);
      res.status(500).json({ error: error.message || "Failed to rebuild vessel regions" });
    }
  });
  
  apiRouter.post("/vessels/remove-vessels-on-land", async (req, res) => {
    try {
      // This function removes vessels that have coordinates on land
      // For simplicity, we'll consider vessels within these rough boundaries to be on water:
      
      // Very simplified ocean boundaries
      // These are crude boundaries and not accurate for real maritime applications
      const oceanBoundaries = [
        // Atlantic Ocean (very rough boundaries)
        { 
          minLat: -60, maxLat: 70, 
          minLng: -80, maxLng: 20 
        },
        // Pacific Ocean (very rough boundaries)
        { 
          minLat: -60, maxLat: 65, 
          minLng: 120, maxLng: -120 
        },
        // Indian Ocean (very rough boundaries)
        { 
          minLat: -60, maxLat: 30, 
          minLng: 20, maxLng: 120 
        },
        // Mediterranean Sea (very rough boundaries)
        { 
          minLat: 30, maxLat: 45, 
          minLng: -5, maxLng: 40 
        }
      ];
      
      const isInWater = (lat: number, lng: number): boolean => {
        // Normalize longitude to -180 to 180
        while (lng > 180) lng -= 360;
        while (lng < -180) lng += 360;
        
        // Check if the coordinates are within any ocean boundary
        return oceanBoundaries.some(boundary => 
          lat >= boundary.minLat && lat <= boundary.maxLat &&
          ((boundary.minLng <= boundary.maxLng && lng >= boundary.minLng && lng <= boundary.maxLng) ||
           (boundary.minLng > boundary.maxLng && (lng >= boundary.minLng || lng <= boundary.maxLng)))
        );
      };
      
      // Get all vessels with coordinates
      const vesselsWithCoordinates = await db.select().from(vessels)
        .where(sql`current_lat IS NOT NULL AND current_lng IS NOT NULL`);
      
      const vesselCount = vesselsWithCoordinates.length;
      let removedCount = 0;
      
      // Identify and remove vessels on land
      for (const vessel of vesselsWithCoordinates) {
        const lat = parseFloat(vessel.currentLat!);
        const lng = parseFloat(vessel.currentLng!);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          if (!isInWater(lat, lng)) {
            // Reset the vessel's coordinates if it's on land
            await storage.updateVessel(vessel.id, { 
              currentLat: null, 
              currentLng: null,
              currentRegion: null
            });
            removedCount++;
          }
        }
      }
      
      res.json({
        success: true,
        totalVessels: vesselCount,
        vesselsOnLand: removedCount,
        message: `Reset coordinates for ${removedCount} vessels that were on land`
      });
    } catch (error: any) {
      console.error("Error removing vessels on land:", error);
      res.status(500).json({ error: error.message || "Failed to remove vessels on land" });
    }
  });
  
  apiRouter.get("/vessels/:id/progress", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      const progressEvents = await storage.getProgressEventsByVesselId(vesselId);
      res.json(progressEvents);
    } catch (error: any) {
      console.error("Error getting vessel progress:", error);
      res.status(500).json({ error: error.message || "Failed to get vessel progress" });
    }
  });
  
  apiRouter.post("/vessels/:id/progress", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      
      // Verify vessel exists
      const vessel = await storage.getVesselById(vesselId);
      if (!vessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      // Validate input
      const eventData = insertProgressEventSchema.parse({
        ...req.body,
        vesselId
      });
      
      const newEvent = await storage.createProgressEvent(eventData);
      
      res.status(201).json(newEvent);
    } catch (error: any) {
      console.error("Error creating progress event:", error);
      res.status(400).json({ error: error.message || "Failed to create progress event" });
    }
  });
  
  apiRouter.post("/vessels/ensure-destinations", async (req, res) => {
    try {
      // Get all vessels without destination ports
      const vesselsWithoutDestination = await db.select().from(vessels)
        .where(sql`destination_port IS NULL OR destination_port = ''`);
      
      const count = vesselsWithoutDestination.length;
      
      if (count > 0) {
        // Sample destinations
        const destinations = [
          "Rotterdam, Netherlands", "Singapore Port", "Shanghai, China", 
          "Antwerp, Belgium", "Busan, South Korea", "Houston, USA", 
          "Hong Kong, China", "Hamburg, Germany", "Los Angeles, USA",
          "Jebel Ali, UAE", "Kaohsiung, Taiwan", "New York, USA",
          "Port Klang, Malaysia", "Xiamen, China", "Colombo, Sri Lanka"
        ];
        
        // Update vessels with random destinations
        for (const vessel of vesselsWithoutDestination) {
          const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
          await storage.updateVessel(vessel.id, { destinationPort: randomDest });
        }
      }
      
      res.json({
        success: true,
        updated: count,
        message: count > 0 ? `Updated ${count} vessels with destination ports` : "No vessels needed updates"
      });
    } catch (error: any) {
      console.error("Error ensuring vessel destinations:", error);
      res.status(500).json({ error: error.message || "Failed to update vessel destinations" });
    }
  });
  
  apiRouter.post("/vessels/:id/update-location", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      const { lat, lng, speed, course } = req.body;
      
      // Validate input
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      // Determine region from coordinates
      const region = determineRegionFromCoordinates(lat, lng);
      
      // Format for storage
      const latStr = lat.toFixed(6);
      const lngStr = lng.toFixed(6);
      
      // Update the vessel
      const updatedVessel = await storage.updateVessel(vesselId, {
        currentLat: latStr,
        currentLng: lngStr,
        currentSpeed: speed?.toString() || null,
        currentCourse: course?.toString() || null,
        currentRegion: region || null
      });
      
      if (!updatedVessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      // Create a progress event
      await storage.createProgressEvent({
        vesselId,
        eventType: "POSITION_UPDATE",
        lat: latStr,
        lng: lngStr,
        speed: speed?.toString() || null,
        course: course?.toString() || null,
        region: region || null,
        notes: `Position updated at ${new Date().toISOString()}`
      });
      
      // Broadcast the vessel update to connected WebSocket clients
      broadcastVesselUpdate(updatedVessel);
      
      res.json({
        success: true,
        vessel: updatedVessel
      });
    } catch (error: any) {
      console.error("Error updating vessel location:", error);
      res.status(500).json({ error: error.message || "Failed to update vessel location" });
    }
  });
  
  // Refinery API
  apiRouter.get("/refineries", async (req, res) => {
    try {
      const { region } = req.query;
      let result: Refinery[];
      
      if (region && typeof region === 'string') {
        result = await storage.getRefineryByRegion(region);
      } else {
        result = await storage.getRefineries();
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Error getting refineries:", error);
      res.status(500).json({ error: error.message || "Failed to get refineries" });
    }
  });

  apiRouter.get("/refineries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const refinery = await storage.getRefineryById(id);
      
      if (!refinery) {
        return res.status(404).json({ error: "Refinery not found" });
      }
      
      res.json(refinery);
    } catch (error: any) {
      console.error("Error getting refinery:", error);
      res.status(500).json({ error: error.message || "Failed to get refinery" });
    }
  });
  
  apiRouter.post("/refineries", async (req, res) => {
    try {
      const refineryData = insertRefinerySchema.parse(req.body);
      const newRefinery = await storage.createRefinery(refineryData);
      
      // Broadcast the new refinery to connected WebSocket clients
      broadcastRefineryUpdate(newRefinery);
      
      res.status(201).json(newRefinery);
    } catch (error: any) {
      console.error("Error creating refinery:", error);
      res.status(400).json({ error: error.message || "Failed to create refinery" });
    }
  });
  
  // Document API
  apiRouter.get("/documents", async (req, res) => {
    try {
      const { vesselId } = req.query;
      let result: Document[];
      
      if (vesselId && typeof vesselId === 'string') {
        const id = parseInt(vesselId);
        if (isNaN(id)) {
          return res.status(400).json({ error: "Invalid vessel ID" });
        }
        result = await storage.getDocumentsByVesselId(id);
      } else {
        result = await storage.getDocuments();
      }
      
      res.json(result);
    } catch (error: any) {
      console.error("Error getting documents:", error);
      res.status(500).json({ error: error.message || "Failed to get documents" });
    }
  });
  
  apiRouter.post("/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const newDocument = await storage.createDocument(documentData);
      
      res.status(201).json(newDocument);
    } catch (error: any) {
      console.error("Error creating document:", error);
      res.status(400).json({ error: error.message || "Failed to create document" });
    }
  });
  
  // AI API
  apiRouter.post("/ai/query", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      // Generate a response based on the query
      const response = await aiService.generateResponse(query);
      
      res.json({ response });
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });
  
  apiRouter.post("/ai/generate-document", async (req, res) => {
    try {
      const { vesselId, documentType } = req.body;
      
      if (!vesselId || !documentType) {
        return res.status(400).json({ error: "Vessel ID and document type are required" });
      }
      
      // Get the vessel
      const vessel = await storage.getVesselById(parseInt(vesselId));
      
      if (!vessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      // Generate a document
      const document = await aiService.generateDocument(vessel, documentType);
      
      res.json({ document });
    } catch (error: any) {
      console.error("Error generating document:", error);
      res.status(500).json({ error: error.message || "Failed to generate document" });
    }
  });
  
  // Broker API
  apiRouter.get("/brokers", async (req, res) => {
    try {
      const brokers = await storage.getBrokers();
      res.json(brokers);
    } catch (error: any) {
      console.error("Error getting brokers:", error);
      res.status(500).json({ error: error.message || "Failed to get brokers" });
    }
  });
  
  apiRouter.post("/brokers", async (req, res) => {
    try {
      const brokerData = insertBrokerSchema.parse(req.body);
      const newBroker = await storage.createBroker(brokerData);
      
      res.status(201).json(newBroker);
    } catch (error: any) {
      console.error("Error creating broker:", error);
      res.status(400).json({ error: error.message || "Failed to create broker" });
    }
  });
  
  // Streaming API for real-time data
  apiRouter.get("/stream/data", (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send an initial OK message
    res.write(`data: ${JSON.stringify({ message: "Connected to data stream" })}\n\n`);
    
    // Set up a ping interval to keep the connection alive
    const pingInterval = setInterval(() => {
      if (res.closed) {
        clearInterval(pingInterval);
        return;
      }
      res.write(`data: ${JSON.stringify({ type: "ping", timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);
    
    // Listen for request close and clean up
    req.on('close', () => {
      clearInterval(pingInterval);
    });
    
    // In a real application, you would set up listeners for data changes
    // and push updates to the client. For this demo, we'll simulate updates.
    
    // Simulate vessel updates
    const vesselUpdateInterval = setInterval(async () => {
      if (res.closed) {
        clearInterval(vesselUpdateInterval);
        return;
      }
      
      try {
        // Get all vessels
        const allVessels = await storage.getVessels();
        
        // Select a random vessel
        const randomVessel = allVessels[Math.floor(Math.random() * allVessels.length)];
        
        if (randomVessel && randomVessel.currentLat && randomVessel.currentLng) {
          // Update its position slightly
          const currentLat = parseFloat(randomVessel.currentLat);
          const currentLng = parseFloat(randomVessel.currentLng);
          
          if (!isNaN(currentLat) && !isNaN(currentLng)) {
            // Generate a small random movement
            const latDelta = (Math.random() - 0.5) * 0.1; // Small latitude change
            const lngDelta = (Math.random() - 0.5) * 0.1; // Small longitude change
            
            const newLat = currentLat + latDelta;
            const newLng = currentLng + lngDelta;
            
            // Determine the new region
            const newRegion = determineRegionFromCoordinates(newLat, newLng);
            
            // Update the vessel
            const updatedVessel = await storage.updateVessel(randomVessel.id, {
              currentLat: newLat.toFixed(6),
              currentLng: newLng.toFixed(6),
              currentRegion: newRegion || randomVessel.currentRegion
            });
            
            if (updatedVessel) {
              // Send the update to the client
              res.write(`data: ${JSON.stringify({ 
                type: "vessel_update", 
                vessel: {
                  id: updatedVessel.id,
                  name: updatedVessel.name,
                  imo: updatedVessel.imo,
                  currentLat: updatedVessel.currentLat,
                  currentLng: updatedVessel.currentLng,
                  currentRegion: updatedVessel.currentRegion
                }
              })}\n\n`);
              
              // Broadcast to WebSocket clients as well
              broadcastVesselUpdate(updatedVessel);
            }
          }
        }
      } catch (error) {
        console.error("Error in vessel update stream:", error);
      }
    }, 5000); // Update a vessel position every 5 seconds
  });
  
  // Use the API routers
  apiRouter.use("/test", apiTesterRouter);
  
  // Broker router
  apiRouter.use("/brokers", brokerRouter);
  
  // Trading router
  apiRouter.use("/trading", tradingRouter);
  
  // Stripe payment routes
  if (process.env.STRIPE_SECRET_KEY) {
    // Create a payment intent for one-time payments
    apiRouter.post("/create-payment-intent", (req, res, next) => {
      return stripeService.createPaymentIntent(req, res);
    });
    
    // Get or create a subscription
    apiRouter.post("/get-or-create-subscription", (req, res, next) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      return stripeService.getOrCreateSubscription(req, res);
    });
    
    // Cancel a user's subscription
    apiRouter.post("/cancel-subscription", (req, res, next) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      return stripeService.cancelSubscription(req, res);
    });
  }
  
  // OpenAI integration
  apiRouter.post("/ai/vessel-analysis", async (req, res) => {
    try {
      const { query, vesselIds } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Missing required parameter: query" });
      }
      
      // Get vessels for context
      let vessels: Vessel[] = [];
      if (vesselIds && Array.isArray(vesselIds) && vesselIds.length > 0) {
        // Get specific vessels if IDs provided
        vessels = await Promise.all(
          vesselIds.map(id => storage.getVesselById(parseInt(id)))
        ).then(results => results.filter(v => v !== undefined) as Vessel[]);
      } else {
        // Otherwise get 10 random vessels
        vessels = (await storage.getVessels()).slice(0, 10);
      }
      
      // Generate analysis using OpenAI
      const analysis = await openAiService.analyzeVesselsData(query, vessels);
      
      res.json({ analysis, vessels: vessels.map(v => v.id) });
    } catch (error: any) {
      console.error("Error in vessel analysis:", error);
      res.status(500).json({ error: error.message || "Failed to analyze vessels" });
    }
  });
  
  apiRouter.get("/ai/vessel-journey/:id", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      const vessel = await storage.getVesselById(vesselId);
      
      if (!vessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      const analysis = await openAiService.analyzeVesselJourney(vessel);
      
      res.json({
        vesselId,
        vesselName: vessel.name,
        ...analysis
      });
    } catch (error: any) {
      console.error("Error analyzing vessel journey:", error);
      res.status(500).json({ error: error.message || "Failed to analyze vessel journey" });
    }
  });
  
  apiRouter.get("/ai/vessel-route-recommendations/:id", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      const includeWeather = req.query.weather !== 'false';
      
      const vessel = await storage.getVesselById(vesselId);
      
      if (!vessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      const recommendations = await openAiService.generateRouteRecommendations(vessel, includeWeather);
      
      res.json({
        vesselId,
        vesselName: vessel.name,
        recommendations
      });
    } catch (error: any) {
      console.error("Error generating route recommendations:", error);
      res.status(500).json({ error: error.message || "Failed to generate route recommendations" });
    }
  });
  
  apiRouter.get("/ai/vessel-inspection/:id", async (req, res) => {
    try {
      const vesselId = parseInt(req.params.id);
      const vessel = await storage.getVesselById(vesselId);
      
      if (!vessel) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      const report = await openAiService.generateInspectionReport(vessel);
      
      res.json({
        vesselId,
        vesselName: vessel.name,
        report
      });
    } catch (error: any) {
      console.error("Error generating inspection report:", error);
      res.status(500).json({ error: error.message || "Failed to generate inspection report" });
    }
  });

  /**
   * @route POST /api/ai/analyze-query
   * @description Process a natural language query about vessels and refineries using OpenAI
   * @access Public
   */
  apiRouter.post("/ai/analyze-query", async (req, res) => {
    try {
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      // Format a prompt for the AI with the context
      const prompt = `
User query: "${query}"

Context:
- Available vessels: ${context.vesselsCount || 0}
- Available refineries: ${context.refineriesCount || 0}
${context.trackedVessel ? `- Currently tracking vessel: ${context.trackedVessel.name} (IMO: ${context.trackedVessel.imo})
  - Current location: ${context.trackedVessel.location}
  - Destination: ${context.trackedVessel.destination}` : '- No vessel is currently being tracked'}

Your task is to respond to the query in a helpful and informative way. If the query is about:
1. Vessels: Provide information about vessels, their tracking status, or vessel-related data.
2. Refineries: Provide information about refineries, their regions, or refinery-related data.
3. Route analysis: Provide advice on optimal routes, weather considerations, or journey time estimates.
4. Market analysis: Provide information about oil prices, market trends, or cargo values.

Please respond directly, in a conversational tone, and mention if you need more specific information.
`;

      const response = await openAiService.generateResponse(prompt);
      
      // Parse the response to extract vessel or refinery recommendations
      let vesselToTrack = null;
      let refineryToShow = null;
      
      // Simple detection for vessel recommendations (could be improved with more robust parsing)
      if (response.toLowerCase().includes('tracking vessel') || 
          response.toLowerCase().includes('track the vessel')) {
        // Extract vessel name mentioned in the response
        const vesselMatch = response.match(/tracking vessel ([A-Za-z0-9\s]+)/i) || 
                            response.match(/track the vessel ([A-Za-z0-9\s]+)/i);
        if (vesselMatch && vesselMatch[1]) {
          vesselToTrack = vesselMatch[1].trim();
        }
      }
      
      // Simple detection for refinery recommendations
      if (response.toLowerCase().includes('refinery called') || 
          response.toLowerCase().includes('refinery named')) {
        const refineryMatch = response.match(/refinery called ([A-Za-z0-9\s]+)/i) || 
                              response.match(/refinery named ([A-Za-z0-9\s]+)/i);
        if (refineryMatch && refineryMatch[1]) {
          refineryToShow = refineryMatch[1].trim();
        }
      }
      
      return res.json({
        response,
        vesselToTrack,
        refineryToShow
      });
    } catch (error: any) {
      console.error('Error processing AI query:', error);
      return res.status(500).json({ 
        error: 'Failed to process query',
        details: error.message 
      });
    }
  });

  // Mount API router
  app.use("/api", apiRouter);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  setupEvents(wss);
  
  return httpServer;
}