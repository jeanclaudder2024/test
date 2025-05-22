import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vesselService } from "./services/vesselService";
import { refineryService } from "./services/refineryService";
import { openaiService } from "./services/openaiService";
import { AIEnhancementService } from "./services/aiEnhancementService";
// Replace dataService from asiStreamService with marineTrafficService
import { marineTrafficService } from "./services/marineTrafficService";
import { refineryDataService } from "./services/refineryDataService";
import { brokerService } from "./services/brokerService";
import { stripeService } from "./services/stripeService";
import { updateRefineryCoordinates, seedMissingRefineries } from "./services/refineryUpdate";
import { seedAllData, regenerateGlobalVessels } from "./services/seedService";
import { seedVesselJobs } from "./scripts/seed-vessel-jobs";
import { portService } from "./services/portService";
import { vesselPositionService } from "./services/vesselPositionService";
import { setupAuth } from "./auth";
import { db } from "./db";
import { REGIONS } from "@shared/constants";
import { 
  getCachedVessels, 
  setCachedVessels, 
  getCachedVesselsByRegion, 
  setCachedVesselsByRegion 
} from "./utils/cacheManager";
import { WebSocketServer, WebSocket } from "ws";
import { 
  insertVesselSchema, 
  insertRefinerySchema, 
  insertProgressEventSchema,
  insertDocumentSchema,
  insertBrokerSchema,
  insertPortSchema,
  Vessel,
  Refinery,
  Port,
  vessels,
  refineries,
  progressEvents,
  documents,
  stats,
  ports
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { apiTesterRouter } from "./routes/apiTester";
import { brokerRouter } from "./routes/brokerRoutes";
import { tradingRouter } from "./routes/tradingRoutes";
import { vesselDistributionRouter } from "./routes/vesselDistributionRoutes";
import { portProximityRouter } from "./routes/port-proximity";
import { generateVesselPositionData } from "./routes/vessel-data-generation";
import { refineryPortRouter } from "./routes/refineryPortRoutes";
import { documentRouter } from "./routes/document-routes";
import { aiRouter } from "./routes/aiRoutes";
import { generateDocumentRouter } from "./routes/generate-document-route";
import { companyRouter } from "./routes/companyRoutes";
import portVesselRouter from "./routes/portVesselRoutes";
import { subscriptionRouter } from "./routes/subscriptionRoutes";
import translationRouter from "./routes/translationRoutes";
import vesselDashboardRouter from "./routes/vessel-dashboard";
import { cargoManifestRouter } from "./routes/cargo-manifest-router";
import { seedBrokers } from "./services/seedService";

// Import route handlers
import { directPdfRouter } from './routes/direct-pdf';
import { enhancedPdfRouter } from './routes/enhanced-pdf';
import { reliablePdfRouter } from './routes/reliable-pdf';
import { maritimeRoutesRouter } from './routes/maritime-routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  const apiRouter = express.Router();

  // Register routes
  app.use("/api/translate", translationRouter);
  app.use("/api/subscriptions", subscriptionRouter);
  
  // Register vessel position data generation endpoint
  app.post("/api/vessels/:id/generate-position-data", generateVesselPositionData);
  
  // Register port proximity router - adds vessels near ports and refineries
  app.use("/api/port-proximity", portProximityRouter);

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

    // Route to clear all vessel and refinery data
    apiRouter.post("/clear-data", async (req, res) => {
      try {
        console.log("Starting data removal process...");
        const results = { vessels: 0, refineries: 0, success: true };
        
        try {
          // Delete all vessel data
          console.log("Removing all vessel data...");
          const vessels = await storage.getVessels();
          for (const vessel of vessels) {
            await storage.deleteVessel(vessel.id);
            results.vessels++;
          }
          console.log(`Successfully removed ${results.vessels} vessels`);
        } catch (error) {
          console.error("Error removing vessel data:", error);
          // Continue with refineries even if vessel deletion fails
        }
        
        try {
          // Delete all refinery data
          console.log("Removing all refinery data...");
          const refineries = await storage.getRefineries();
          for (const refinery of refineries) {
            await storage.deleteRefinery(refinery.id);
            results.refineries++;
          }
          console.log(`Successfully removed ${results.refineries} refineries`);
        } catch (error) {
          console.error("Error removing refinery data:", error);
        }
        
        // Return results
        res.json({
          success: true,
          message: "All vessel and refinery data has been cleared",
          data: results
        });
      } catch (error) {
        console.error("Error clearing data:", error);
        res.status(500).json({ success: false, message: "Failed to clear data" });
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
        
        // Seed port data
        let portResult = { ports: 0, seeded: false };
        try {
          console.log("Seeding port data...");
          portResult = await portService.seedPortData();
          console.log("Port data seeded successfully:", portResult);
        } catch (portError) {
          console.error("Error seeding port data:", portError);
          // Continue with what we have
        }
        
        // Return whatever data we managed to seed
        // Check for vessel job data
        let vesselJobsResult = { jobs: 0, extraInfo: 0, docs: 0, seeded: false };
        try {
          const seedJobsResult = await seedVesselJobs();
          // Ensure we have all required properties
          vesselJobsResult = {
            jobs: seedJobsResult.jobs || 0,
            extraInfo: seedJobsResult.extraInfo || 0,
            docs: seedJobsResult.docs || 0,
            seeded: seedJobsResult.seeded
          };
          console.log("Vessel job data seeded successfully:", vesselJobsResult);
        } catch (jobError) {
          console.error("Error seeding vessel job data:", jobError);
          // Continue with what we have
        }
        
        res.json({ 
          success: true, 
          message: "Seed data process completed",
          data: { 
            vessels: vesselResult.vessels || 0,
            oilVessels: vesselResult.oilVessels || 0,
            totalCargo: vesselResult.totalCargo || 0,
            refineries: refineryResult.refineries || 0,
            active: refineryResult.active || 0,
            brokers: brokerResult.count || 0,
            ports: portResult.ports || 0,
            vesselJobs: vesselJobsResult.jobs || 0,
            vesselDocs: vesselJobsResult.docs || 0
          }
        });
      } catch (error) {
        console.error("Critical error in seed process:", error);
        res.status(500).json({ message: "Failed to seed data" });
      }
    });
    
    // Add a new endpoint to update ports with 2025 data
    apiRouter.post("/ports/update-to-2025", async (req, res) => {
      try {
        console.log("Starting port update to 2025 data...");
        
        // Update ports with the latest 2025 data
        const portUpdateResult = await portService.updatePortsWith2025Data();
        console.log("Port data updated to 2025 successfully:", portUpdateResult);
        
        res.json({
          success: true,
          message: "Port data has been updated to 2025",
          data: {
            updated: portUpdateResult.updated,
            added: portUpdateResult.added,
            total: portUpdateResult.updated + portUpdateResult.added
          }
        });
      } catch (error) {
        console.error("Error updating ports to 2025 data:", error);
        res.status(500).json({ message: "Failed to update port data to 2025" });
      }
    });
    
    // Add a new endpoint to update refineries with real data
    apiRouter.post("/refineries/update-real-data", async (req, res) => {
      try {
        console.log("Starting refinery update with real-world data...");
        
        // Update refineries with real data from the refineryDataService
        const refineries = await refineryDataService.seedRealRefineryData();
        console.log(`Successfully updated refineries with ${refineries.length} real-world refineries`);
        
        res.json({
          success: true,
          message: "Refinery data has been updated with real-world information",
          data: {
            count: refineries.length,
            regions: refineries.reduce((acc, r) => {
              acc[r.region] = (acc[r.region] || 0) + 1;
              return acc;
            }, {})
          }
        });
      } catch (error) {
        console.error("Error updating refineries with real data:", error);
        res.status(500).json({ message: "Failed to update refineries with real data" });
      }
    });
    
    // Add a new endpoint to add all world ports to the database
    apiRouter.post("/ports/add-all-world-ports", async (req, res) => {
      try {
        console.log("Starting to add all world ports to the database...");
        
        // Add all comprehensive world ports data
        const addWorldPortsResult = await portService.addAllWorldPorts();
        console.log("World ports added successfully:", addWorldPortsResult);
        
        res.json({
          success: true,
          message: "All world ports have been added to the database",
          data: {
            added: addWorldPortsResult.added,
            total: addWorldPortsResult.total
          }
        });
      } catch (error) {
        console.error("Error adding world ports:", error);
        res.status(500).json({ message: "Failed to add world ports to the database" });
      }
    });
    
    // Add a new endpoint to import large-scale port data (7,000+ ports)
    apiRouter.post("/ports/import-large-scale", async (req, res) => {
      try {
        console.log("Starting large-scale port data import process...");
        
        // Generate the 7,183 ports directly here
        console.log('Generating 7,183 comprehensive world ports...');
        let completeWorldPorts = [];
        
        // Define the regions and their approximate port counts to reach 7,183 total
        const regions = {
          'Asia-Pacific': { count: 2400, countries: ['China', 'Japan', 'South Korea', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Australia', 'New Zealand', 'India'] },
          'Europe': { count: 1800, countries: ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Denmark', 'Norway', 'Sweden', 'Finland', 'Greece', 'Russia'] },
          'North America': { count: 1200, countries: ['United States', 'Canada', 'Mexico'] },
          'Latin America': { count: 800, countries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Panama'] },
          'Middle East': { count: 500, countries: ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Iraq', 'Iran'] },
          'Africa': { count: 483, countries: ['South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Tanzania', 'Angola'] }
        };
        
        // Port name prefixes by type
        const prefixes = [
          'Port of', 'Harbor of', 'Terminal', 'Marine Terminal', 'Shipping Center', 
          'Dock', 'Pier', 'Wharf', 'Gateway', 'Maritime Port', 'Port'
        ];
        
        // Generate ports for each region
        let portId = 1;
        
        for (const [region, data] of Object.entries(regions)) {
          console.log(`Generating ${data.count} ports for ${region} region...`);
          
          for (let i = 0; i < data.count; i++) {
            // Select a random country from the region
            const country = data.countries[Math.floor(Math.random() * data.countries.length)];
            
            // Generate a port name
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const portName = `${prefix} ${country} ${i + 1}`;
            
            // Determine if it's an oil port (approximately 20% of all ports)
            const isOilPort = Math.random() < 0.2;
            const portType = isOilPort ? 'oil' : 'commercial';
            
            // Generate coordinates in the appropriate region (approximate)
            let lat, lng;
            
            // Set lat/lng based on region (approximate values)
            switch(region) {
              case 'Asia-Pacific':
                lat = Math.random() * 80 - 40; // -40 to 40
                lng = Math.random() * 110 + 70; // 70 to 180
                break;
              case 'Europe':
                lat = Math.random() * 35 + 35; // 35 to 70
                lng = Math.random() * 50 - 10; // -10 to 40
                break;
              case 'North America':
                lat = Math.random() * 55 + 15; // 15 to 70
                lng = Math.random() * 120 - 170; // -170 to -50
                break;
              case 'Latin America':
                lat = Math.random() * 80 - 55; // -55 to 25
                lng = Math.random() * 80 - 110; // -110 to -30
                break;
              case 'Middle East':
                lat = Math.random() * 30 + 12; // 12 to 42
                lng = Math.random() * 27 + 35; // 35 to 62
                break;
              case 'Africa':
                lat = Math.random() * 70 - 35; // -35 to 35
                lng = Math.random() * 75 - 20; // -20 to 55
                break;
              default:
                lat = Math.random() * 180 - 90; // -90 to 90
                lng = Math.random() * 360 - 180; // -180 to 180
            }
            
            // Generate port capacity
            const capacity = isOilPort 
              ? 50000 + Math.floor(Math.random() * 2000000) // Oil ports have larger capacity
              : 10000 + Math.floor(Math.random() * 500000);  // Commercial ports
            
            // Generate a description based on port type
            let description;
            if (isOilPort) {
              description = `${portName} is a major oil shipping terminal in ${country}, processing millions of tons of crude oil and petroleum products annually.`;
            } else {
              description = `${portName} is a commercial shipping port in ${country}, facilitating trade and commerce in the region.`;
            }
            
            // Create port object
            const port = {
              name: portName,
              country: country,
              region: region,
              lat: String(lat.toFixed(6)),
              lng: String(lng.toFixed(6)),
              capacity: capacity,
              status: 'active',
              description: description,
              type: portType
            };
            
            completeWorldPorts.push(port);
            
            // Log progress occasionally
            if (portId % 1000 === 0) {
              console.log(`Generated ${portId} ports so far...`);
            }
            
            portId++;
          }
        }
        
        console.log(`Generated ${completeWorldPorts.length} ports programmatically`);
        
        // Import the generated ports 
        const importResult = await portService.addLargeScalePortData(completeWorldPorts);
        console.log("Large-scale port data imported successfully:", importResult);
        
        res.json({
          success: true,
          message: "Large-scale port data has been imported successfully",
          data: {
            added: importResult.added,
            skipped: importResult.skipped,
            total: importResult.total
          }
        });
      } catch (error) {
        console.error("Error importing large-scale port data:", error);
        res.status(500).json({ message: "Failed to import large-scale port data" });
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
      // Try to get counts from vesselService first
      let result;
      
      try {
        result = await vesselService.getVesselCountsByRegion();
      } catch (dbError) {
        console.warn("Database error when fetching vessel counts, using API directly:", dbError);
        
        // Fallback to direct API data if database access fails
        if (marineTrafficService.isConfigured()) {
          // Fetch vessels directly from MyShipTracking API
          const vessels = await marineTrafficService.fetchVessels();
          
          // Calculate region distribution
          const regionCounts: Record<string, number> = {};
          const oilVesselRegionCounts: Record<string, number> = {};
          let totalOilVessels = 0;
          
          // Count vessels by region
          vessels.forEach(vessel => {
            const region = vessel.currentRegion || 'unknown';
            
            // Add to region counts
            regionCounts[region] = (regionCounts[region] || 0) + 1;
            
            // Check if it's an oil vessel
            const isOilVessel = vessel.vesselType?.toLowerCase().includes('oil') || 
                              vessel.vesselType?.toLowerCase().includes('tanker');
            
            if (isOilVessel) {
              oilVesselRegionCounts[region] = (oilVesselRegionCounts[region] || 0) + 1;
              totalOilVessels++;
            }
          });
          
          result = {
            totalVessels: vessels.length,
            totalOilVessels: totalOilVessels,
            regionCounts: regionCounts,
            oilVesselRegionCounts: oilVesselRegionCounts
          };
        } else {
          // Create a simple fallback with default values
          result = {
            totalVessels: 500,
            totalOilVessels: 350,
            regionCounts: {
              middle_east: 150,
              europe: 100,
              north_america: 120,
              east_asia: 80,
              global: 50
            },
            oilVesselRegionCounts: {
              middle_east: 120,
              europe: 70,
              north_america: 80,
              east_asia: 50,
              global: 30
            }
          };
        }
      }
      
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

  // Ports endpoints
  apiRouter.get("/ports", async (req, res) => {
    try {
      console.log("API request for ports received");
      
      // Get port data from API with database fallback
      let ports: Port[] = [];
      
      // First try to get ports from MyShipTracking API
      if (marineTrafficService.isConfigured()) {
        try {
          console.log("Attempting to fetch ports from MyShipTracking API...");
          const apiPorts = await marineTrafficService.fetchPorts();
          
          if (apiPorts && apiPorts.length > 0) {
            ports = apiPorts as Port[];
            console.log(`Retrieved ${ports.length} ports from MyShipTracking API`);
          } else {
            console.log("API returned 0 ports, falling back to database");
          }
        } catch (apiError) {
          console.error("Error fetching ports from API:", apiError);
          console.log("Falling back to database for port data");
        }
      } else {
        console.log("MyShipTracking API not configured, using database for port data");
      }
      
      // If API call failed or returned no data, use database
      if (ports.length === 0) {
        try {
          ports = await portService.getAllPorts();
          console.log(`Retrieved ${ports.length} ports from database`);
        } catch (dbError) {
          console.error("Database error when fetching ports:", dbError);
          res.status(500).json({ message: "Failed to fetch port data from any source" });
          return;
        }
      }
      
      res.json(ports);
    } catch (error) {
      console.error("Error handling port request:", error);
      res.status(500).json({ message: "Failed to fetch port data" });
    }
  });
  
  // Port detail endpoint
  apiRouter.get("/ports/:id", async (req, res) => {
    try {
      const portId = parseInt(req.params.id);
      if (isNaN(portId)) {
        return res.status(400).json({ message: "Invalid port ID" });
      }
      
      // Get port from database
      const port = await portService.getPortById(portId);
      
      if (!port) {
        return res.status(404).json({ message: "Port not found" });
      }
      
      res.json(port);
    } catch (error) {
      console.error(`Error getting port ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch port data" });
    }
  });
  
  // Ports by region endpoint
  apiRouter.get("/ports/region/:region", async (req, res) => {
    try {
      const region = req.params.region;
      if (!region) {
        return res.status(400).json({ message: "Region parameter is required" });
      }
      
      // Get ports from database
      const ports = await portService.getPortsByRegion(region);
      
      res.json(ports);
    } catch (error) {
      console.error(`Error getting ports for region ${req.params.region}:`, error);
      res.status(500).json({ message: "Failed to fetch port data by region" });
    }
  });

  // MyShipTracking API endpoints
  apiRouter.get("/vessels/marine-traffic", async (req, res) => {
    try {
      if (!marineTrafficService.isConfigured()) {
        return res.status(503).json({ 
          message: "MyShipTracking API is not configured. Please set MARINE_TRAFFIC_API_KEY environment variable." 
        });
      }
      
      const vessels = await marineTrafficService.fetchVessels();
      console.log(`Fetched ${vessels.length} vessels from MyShipTracking API`);
      
      res.json(vessels);
    } catch (error) {
      console.error("Error fetching vessels from MyShipTracking:", error);
      res.status(500).json({ message: "Failed to fetch vessels from MyShipTracking API" });
    }
  });

  // New endpoint for MyShipTracking API vessel details by MMSI
  apiRouter.get("/vessels/lookup/:mmsi", async (req, res) => {
    try {
      const { mmsi } = req.params;
      
      if (!process.env.MYSHIPTRACKING_API_KEY) {
        return res.status(503).json({ 
          message: "MyShipTracking API is not configured. Please set MYSHIPTRACKING_API_KEY environment variable." 
        });
      }
      
      // Import the shiptracking functions
      const { getVesselByMmsi } = await import("./shiptracking");
      
      // Call the vessel lookup handler
      return getVesselByMmsi(req, res);
    } catch (error) {
      console.error("Error looking up vessel with MMSI:", error);
      return res.status(500).json({ 
        message: "Failed to fetch vessel details from MyShipTracking API" 
      });
    }
  });
  
  // Batch lookup for multiple vessels by MMSI
  apiRouter.post("/vessels/lookup/batch", async (req, res) => {
    try {
      if (!process.env.MYSHIPTRACKING_API_KEY) {
        return res.status(503).json({ 
          message: "MyShipTracking API is not configured. Please set MYSHIPTRACKING_API_KEY environment variable." 
        });
      }
      
      // Import the shiptracking functions
      const { getBatchVesselDetails } = await import("./shiptracking");
      
      // Call the batch vessel lookup handler
      return getBatchVesselDetails(req, res);
    } catch (error) {
      console.error("Error in batch vessel lookup:", error);
      return res.status(500).json({ 
        message: "Failed to fetch vessel details batch from MyShipTracking API" 
      });
    }
  });
  
  // Legacy endpoint for MyShipTracking API - compatibility
  apiRouter.get("/vessels/myshiptracking", async (req, res) => {
    try {
      if (!marineTrafficService.isConfigured()) {
        return res.status(503).json({ 
          message: "MyShipTracking API is not configured. Please set MARINE_TRAFFIC_API_KEY environment variable." 
        });
      }
      
      // Fetch vessels from MyShipTracking using the same service
      const vessels = await marineTrafficService.fetchVessels();
      console.log(`Fetched ${vessels.length} vessels from MyShipTracking API for direct integration`);
      
      // Return the vessels in the same format
      res.json(vessels);
    } catch (error) {
      console.error("Error fetching vessels from MyShipTracking direct API:", error);
      res.status(500).json({ message: "Failed to fetch vessels from MyShipTracking API" });
    }
  });
  
  // Endpoint to get vessels near a refinery using MyShipTracking API
  apiRouter.get("/vessels/near-refinery/:id", async (req, res) => {
    try {
      const refineryId = parseInt(req.params.id);
      if (isNaN(refineryId)) {
        return res.status(400).json({ message: "Invalid refinery ID" });
      }
      
      // Try to get refinery from database first
      let refineryLat: number | null = null;
      let refineryLng: number | null = null;
      let refineryName: string | null = null;
      
      try {
        // Get the refinery from database
        const refinery = await storage.getRefineryById(refineryId);
        if (refinery) {
          refineryLat = typeof refinery.lat === 'number' 
            ? refinery.lat 
            : parseFloat(String(refinery.lat));
            
          refineryLng = typeof refinery.lng === 'number'
            ? refinery.lng
            : parseFloat(String(refinery.lng));
            
          refineryName = refinery.name;
        }
      } catch (dbError) {
        console.warn(`Database error when fetching refinery ${refineryId}, using hardcoded coordinates:`, dbError);
      }
      
      // If database access failed, use hardcoded coordinates for known refineries
      if (refineryLat === null || refineryLng === null) {
        // Hardcoded coordinates for major refineries by ID
        const refineryCoordinates: Record<number, {lat: number, lng: number, name: string}> = {
          // MENA Region
          1001: { lat: 29.9476, lng: 48.1357, name: "Al-Ahmadi Refinery" },  // Kuwait
          1002: { lat: 26.2172, lng: 50.1995, name: "Ras Tanura Refinery" }, // Saudi Arabia
          1003: { lat: 25.3548, lng: 51.5244, name: "Mesaieed Refinery" },   // Qatar
          
          // Europe Region
          2001: { lat: 51.8738, lng: 4.2999, name: "Rotterdam Refinery" },   // Netherlands
          2002: { lat: 45.7904, lng: 4.8823, name: "Feyzin Refinery" },      // France
          2003: { lat: 37.9838, lng: 23.5358, name: "Aspropyrgos Refinery" },// Greece
          
          // North America
          3001: { lat: 29.7604, lng: -95.3698, name: "Houston Refinery" },   // USA
          3002: { lat: 40.6443, lng: -74.0259, name: "Bayway Refinery" },    // USA
          3003: { lat: 47.5941, lng: -52.7344, name: "Come By Chance" },     // Canada
          
          // East Asia
          4001: { lat: 35.5011, lng: 139.7799, name: "Kawasaki Refinery" },  // Japan
          4002: { lat: 23.1358, lng: 113.2757, name: "Guangzhou Refinery" }, // China
          4003: { lat: 1.2988, lng: 103.7378, name: "Jurong Refinery" }      // Singapore
        };
        
        // Use hardcoded coordinates if available
        if (refineryCoordinates[refineryId]) {
          refineryLat = refineryCoordinates[refineryId].lat;
          refineryLng = refineryCoordinates[refineryId].lng;
          refineryName = refineryCoordinates[refineryId].name;
          console.log(`Using hardcoded coordinates for ${refineryName}: ${refineryLat}, ${refineryLng}`);
        } else {
          // Use default coordinates in the Arabian Gulf if refinery not found
          refineryLat = 26.2172;
          refineryLng = 50.1995;
          refineryName = "Default Refinery";
          console.log(`Refinery ${refineryId} not found, using default Arabian Gulf coordinates`);
        }
      }
      
      // Try to use the MyShipTracking API if configured
      if (marineTrafficService.isConfigured()) {
        try {
          // Use the MyShipTracking vessels_in_area endpoint to get vessels
          // This requires port_id in MyShipTracking API, which we may not have
          // So we'll use the general query and filter by distance
          const allVessels = await marineTrafficService.fetchVessels();
          
          // Function to check if coordinates are likely in water
          const isLikelyInWater = (lat: number, lng: number): boolean => {
            // Check valid coordinate range
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
            
            // Check for major land masses
            
            // North America mainland
            if (lat >= 25 && lat <= 60 && lng >= -120 && lng <= -70) {
              // Exceptions for navigable waters
              if (
                (lat >= 41 && lat <= 49 && lng >= -93 && lng <= -76) || // Great Lakes
                (lat >= 29 && lat <= 31 && lng >= -91 && lng <= -89) || // Mississippi Delta
                (lat >= 37 && lat <= 40 && lng >= -77 && lng <= -75)    // Chesapeake Bay
              ) return true;
              
              return false; // Otherwise assume land
            }
            
            // Central Asia/Europe - far from coastlines
            if (lat >= 40 && lat <= 55 && lng >= 75 && lng <= 110) return false;
            
            // Central Africa/Sahara Desert
            if (lat >= 15 && lat <= 30 && lng >= 10 && lng <= 30) return false;
            
            // Central South America/Amazon
            if (lat >= -10 && lat <= 5 && lng >= -70 && lng <= -50) return false;
            
            // Central Australia
            if (lat >= -30 && lat <= -20 && lng >= 125 && lng <= 140) return false;
            
            // Major shipping lanes (definitely water)
            
            // Gulf of Mexico & Caribbean
            if (lat >= 15 && lat <= 30 && lng >= -98 && lng <= -65) return true;
            
            // Persian Gulf (oil shipping)
            if (lat >= 24 && lat <= 30 && lng >= 48 && lng <= 57) return true;
            
            // South China Sea
            if (lat >= 0 && lat <= 25 && lng >= 105 && lng <= 120) return true;
            
            // Mediterranean
            if (lat >= 30 && lat <= 45 && lng >= -5 && lng <= 36) return true;
            
            // North Sea & Baltic
            if (lat >= 50 && lat <= 62 && lng >= -4 && lng <= 25) return true;
            
            // Major oceans - these are generally safe
            if (
              // Atlantic
              (lng >= -65 && lng <= -10 && lat >= -50 && lat <= 60) ||
              // Pacific
              ((lng <= -120 || lng >= 120) && lat >= -50 && lat <= 60) ||
              // Indian Ocean
              (lng >= 45 && lng <= 100 && lat >= -40 && lat <= 25)
            ) return true;
            
            // Assume water unless very clearly on land
            return true;
          };
          
          // Filter vessels by distance from refinery (within ~500km) and in water
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
          
          console.log(`Found ${nearbyVessels.length} vessels near refinery ${refineryId} from MyShipTracking API`);
          return res.json(nearbyVessels);
        } catch (apiError) {
          console.error("Error using MyShipTracking API for nearby vessels:", apiError);
          // Fall back to database in case of API error
        }
      }
      
      // Fallback: Try to fetch vessels from the database that are near this refinery
      try {
        const allVessels = await storage.getVessels();
        
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
          const latDiff = Math.abs(vesselLat - refineryLat!);
          const lngDiff = Math.abs(vesselLng - refineryLng!);
          
          // Rough approximation for ~500km
          return (latDiff*latDiff + lngDiff*lngDiff) < 25;
        });
        
        console.log(`Found ${nearbyVessels.length} vessels near refinery ${refineryId} from database`);
        res.json(nearbyVessels);
      } catch (dbError) {
        console.error("Error fetching vessels from database:", dbError);
        // Return empty array if database access fails
        res.json([]);
      }
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
  
  // Static vessels endpoint for emergency fallback
  apiRouter.get("/vessels/static", async (req, res) => {
    try {
      console.log("Static vessels fallback endpoint requested");
      
      // Get a small subset of vessels from the database
      let vessels = await storage.getVessels();
      
      // Only take up to 25 vessels for quick loading
      if (vessels && vessels.length > 0) {
        vessels = vessels.slice(0, 25);
      }
      
      if (!vessels || vessels.length === 0) {
        // Create some emergency static vessels if database fails
        vessels = [
          {
            id: 1,
            name: "Pacific Navigator",
            vesselType: "Oil Tanker",
            flag: "Panama",
            currentLat: "43.427844",
            currentLng: "-41.004669",
            imo: "9876543",
            mmsi: "123456789",
            vesselStatus: "Active",
            destination: "Rotterdam",
            length: 250,
            beam: 40,
            draught: 12.5,
            built: 2010,
            deadweight: 120000,
            grossTonnage: 65000
          },
          {
            id: 2,
            name: "Western Commander",
            vesselType: "Crude Oil Tanker",
            flag: "Liberia",
            currentLat: "-6.265956",
            currentLng: "72.825185",
            imo: "8765432",
            mmsi: "234567890",
            vesselStatus: "Active",
            destination: "Singapore",
            length: 280,
            beam: 45,
            draught: 14.2,
            built: 2015,
            deadweight: 160000,
            grossTonnage: 85000
          },
          {
            id: 3,
            name: "Arctic Aurora",
            vesselType: "LNG Carrier",
            flag: "Marshall Islands",
            currentLat: "35.600700",
            currentLng: "-40.199942",
            imo: "7654321",
            mmsi: "345678901",
            vesselStatus: "Active",
            destination: "New York",
            length: 290,
            beam: 46,
            draught: 13.8,
            built: 2018,
            deadweight: 145000,
            grossTonnage: 95000
          }
        ];
      }
      
      res.json(vessels);
      console.log(`Static vessel fallback returned ${vessels.length} vessels`);
    } catch (error) {
      console.error("Error in static vessels fallback:", error);
      res.status(500).json({ message: "Failed to fetch vessels" });
    }
  });
  
  // Create a specific API endpoint for polling vessel data as WebSocket fallback
  apiRouter.get("/vessels/polling", async (req, res) => {
    try {
      console.log('REST API polling request received');
      
      // Get region from query parameter if present
      const region = req.query.region as string | undefined;
      
      // Fetch vessels
      let vessels;
      if (region && region !== 'global') {
        vessels = await vesselService.getVesselsByRegion(region);
        console.log(`Fetched ${vessels.length} vessels for region: ${region}`);
      } else {
        vessels = await vesselService.getAllVessels();
        console.log(`Fetched ${vessels.length} vessels globally`);
      }
      
      // Always return all vessels to ensure full vessel count is displayed
      const showAllVessels = req.query.all === 'true' || true; // Default to showing all vessels
      
      // Set parameters to include all vessels
      const page = 1;
      const pageSize = showAllVessels ? vessels.length : 3000;
      
      // Apply pagination only if not showing all
      const paginatedVessels = vessels; // Return all vessels
      
      // Return with timestamp and metadata for pagination
      res.json({
        vessels: paginatedVessels,
        timestamp: new Date().toISOString(),
        count: paginatedVessels.length,
        totalCount: vessels.length,
        totalPages: Math.ceil(vessels.length / pageSize),
        currentPage: page,
        pageSize: pageSize
      });
      
      console.log(`Sent ${paginatedVessels.length} vessels to client via REST API polling (page ${page}/${Math.ceil(vessels.length / pageSize)})`);
    } catch (error) {
      console.error('Error in vessel polling API:', error);
      res.status(500).json({ 
        error: 'Failed to fetch vessels',
        timestamp: new Date().toISOString()
      });
    }
  });

  // API endpoint to get vessel region distribution statistics
  apiRouter.get("/vessels/distribution", async (req, res) => {
    try {
      try {
        // Try to get vessels from database first
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
          const vesselType = vessel.vesselType || '';
          return cargoType.toLowerCase().includes('crude') 
            || cargoType.toLowerCase().includes('oil')
            || vesselType.toLowerCase().includes('tanker')
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
      } catch (dbError) {
        console.warn("Database error fetching vessel distribution, trying API:", dbError);
        
        // Fallback to direct API data if database access fails
        if (marineTrafficService.isConfigured()) {
          try {
            // Get vessels from API directly
            const vessels = await marineTrafficService.fetchVessels();
            
            // Count vessels by region
            const regionCounts: Record<string, number> = {};
            vessels.forEach(vessel => {
              const region = vessel.currentRegion || 'unknown';
              regionCounts[region] = (regionCounts[region] || 0) + 1;
            });
            
            // Count oil vessels
            const oilVessels = vessels.filter(vessel => {
              return vessel.vesselType?.toLowerCase().includes('tanker') || 
                     vessel.vesselType?.toLowerCase().includes('oil');
            });
            
            // Count oil vessels by region
            const oilVesselRegionCounts: Record<string, number> = {};
            oilVessels.forEach(vessel => {
              const region = vessel.currentRegion || 'unknown';
              oilVesselRegionCounts[region] = (oilVesselRegionCounts[region] || 0) + 1;
            });
            
            // Calculate cargo capacity by region (if available)
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
          } catch (apiError) {
            console.error("Error fetching vessel distribution from API:", apiError);
            
            // If both database and API fail, return default distribution data
            const defaultDistribution = {
              totalVessels: 500,
              totalOilVessels: 350,
              regionCounts: {
                middle_east: 150,
                europe: 100,
                north_america: 120,
                east_asia: 80,
                global: 50
              },
              oilVesselRegionCounts: {
                middle_east: 120,
                europe: 70,
                north_america: 80,
                east_asia: 50,
                global: 30
              },
              cargoByRegion: {
                middle_east: 1500000,
                europe: 900000,
                north_america: 1200000,
                east_asia: 800000,
                global: 400000
              }
            };
            
            res.json(defaultDistribution);
          }
        } else {
          // API not configured, return default distribution data
          const defaultDistribution = {
            totalVessels: 500,
            totalOilVessels: 350,
            regionCounts: {
              middle_east: 150,
              europe: 100,
              north_america: 120,
              east_asia: 80,
              global: 50
            },
            oilVesselRegionCounts: {
              middle_east: 120,
              europe: 70,
              north_america: 80,
              east_asia: 50,
              global: 30
            },
            cargoByRegion: {
              middle_east: 1500000,
              europe: 900000,
              north_america: 1200000,
              east_asia: 800000,
              global: 400000
            }
          };
          
          res.json(defaultDistribution);
        }
      }
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
  
  // Get the current location of a vessel from the API
  apiRouter.get("/vessels/:id/location", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vessel ID" });
      }
      
      // Get the vessel first to get the IMO or MMSI
      const vessel = await storage.getVesselById(id);
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      // Check if the MyShipTracking API is configured
      if (!marineTrafficService.isConfigured()) {
        return res.status(503).json({ 
          message: "MyShipTracking API is not configured. Please set MARINE_TRAFFIC_API_KEY environment variable.",
          currentLocation: {
            currentLat: vessel.currentLat,
            currentLng: vessel.currentLng,
            lastUpdated: new Date(),
            fromDatabase: true
          }
        });
      }
      
      // Try to get the current location from the API
      let identifier = vessel.imo;
      if (!identifier || identifier.startsWith('MST-')) {
        // If no IMO or it's a generated one, try MMSI
        identifier = vessel.mmsi;
      }
      
      if (!identifier) {
        return res.status(400).json({ 
          message: "Vessel has no valid IMO or MMSI identifier",
          currentLocation: {
            currentLat: vessel.currentLat,
            currentLng: vessel.currentLng,
            lastUpdated: new Date(),
            fromDatabase: true
          }
        });
      }
      
      const locationData = await marineTrafficService.fetchVesselLocation(identifier);
      
      if (!locationData) {
        // If API request fails, return the last known location from the database
        return res.json({
          message: "Could not fetch current location from API. Using last known location.",
          currentLocation: {
            currentLat: vessel.currentLat,
            currentLng: vessel.currentLng,
            lastUpdated: new Date(),
            fromDatabase: true
          }
        });
      }
      
      // Return the API location data
      res.json({
        message: "Successfully fetched current location from API",
        currentLocation: {
          ...locationData,
          fromAPI: true
        }
      });
      
      // Optionally, update the database with the new location in the background
      try {
        const now = new Date();
        await storage.updateVessel(id, {
          currentLat: locationData.currentLat,
          currentLng: locationData.currentLng
        });
        console.log(`Updated vessel ${vessel.name} (ID: ${id}) location in database`);
      } catch (updateError) {
        console.error(`Error updating vessel location in database:`, updateError);
        // Don't fail the request if the database update fails
      }
      
    } catch (error) {
      console.error("Error fetching vessel location:", error);
      res.status(500).json({ message: "Failed to fetch vessel location" });
    }
  });
  
  // Get route coordinates for a vessel, fetching port location data
  apiRouter.get("/vessels/:id/route", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vessel ID" });
      }
      
      // Get the vessel to get departure/destination ports
      const vessel = await storage.getVesselById(id);
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      // Initialize the route data with vessel's current position
      const routeData: {
        vessel: any,
        currentPosition: { lat: number, lng: number } | null,
        departurePosition: { 
          lat: number, 
          lng: number, 
          portId?: number, 
          portName?: string,
          isEstimated?: boolean 
        } | null,
        destinationPosition: { 
          lat: number, 
          lng: number, 
          portId?: number, 
          portName?: string,
          isEstimated?: boolean 
        } | null,
        stopovers: any[]
      } = {
        vessel,
        currentPosition: vessel.currentLat && vessel.currentLng ? {
          lat: Number(vessel.currentLat),
          lng: Number(vessel.currentLng),
        } : null,
        departurePosition: null,
        destinationPosition: null,
        stopovers: []
      };
      
      // Get all ports to search for departure and destination
      const allPorts = await storage.getPorts();
      
      // Find departure port
      if (vessel.departurePort) {
        const departurePorts = allPorts.filter(port => {
          // Simplify port name and vessel's departure port for matching
          const simplifiedPortName = port.name.toLowerCase().replace(/port of |terminal|port/g, '').trim();
          const simplifiedDeparturePort = vessel.departurePort.toLowerCase().replace(/port of |terminal|port/g, '').trim();
          
          // Check if port name is contained in departure port name or vice versa
          return simplifiedPortName.includes(simplifiedDeparturePort) || 
                 simplifiedDeparturePort.includes(simplifiedPortName);
        });
        
        if (departurePorts.length > 0) {
          // Use the first matching port for departure coordinates
          routeData.departurePosition = {
            lat: Number(departurePorts[0].lat),
            lng: Number(departurePorts[0].lng),
            portId: departurePorts[0].id,
            portName: departurePorts[0].name,
          };
        }
      }
      
      // Find destination port
      if (vessel.destinationPort) {
        const destinationPorts = allPorts.filter(port => {
          // Simplify port name and vessel's destination port for matching
          const simplifiedPortName = port.name.toLowerCase().replace(/port of |terminal|port/g, '').trim();
          const simplifiedDestinationPort = vessel.destinationPort.toLowerCase().replace(/port of |terminal|port/g, '').trim();
          
          // Check if port name is contained in destination port name or vice versa
          return simplifiedPortName.includes(simplifiedDestinationPort) || 
                 simplifiedDestinationPort.includes(simplifiedPortName);
        });
        
        if (destinationPorts.length > 0) {
          // Use the first matching port for destination coordinates
          routeData.destinationPosition = {
            lat: Number(destinationPorts[0].lat),
            lng: Number(destinationPorts[0].lng),
            portId: destinationPorts[0].id,
            portName: destinationPorts[0].name,
          };
        }
      }
      
      // If we don't have coordinates for departure or destination,
      // and the vessel has current coords, estimate departure/destination based on bearing
      if ((!routeData.departurePosition || !routeData.destinationPosition) && vessel.currentLat && vessel.currentLng) {
        if (!routeData.departurePosition && vessel.departurePort) {
          // Estimate departure as 500 nautical miles behind current position
          routeData.departurePosition = {
            lat: Number(vessel.currentLat) - 3, // Simple estimation, moving 3 degrees south
            lng: Number(vessel.currentLng) - 5, // Simple estimation, moving 5 degrees west
            isEstimated: true,
            portName: vessel.departurePort
          };
        }
        
        if (!routeData.destinationPosition && vessel.destinationPort) {
          // Estimate destination as 500 nautical miles ahead of current position
          routeData.destinationPosition = {
            lat: Number(vessel.currentLat) + 3, // Simple estimation, moving 3 degrees north
            lng: Number(vessel.currentLng) + 5, // Simple estimation, moving 5 degrees east
            isEstimated: true,
            portName: vessel.destinationPort
          };
        }
      }
      
      // Return the route data
      res.json({
        message: "Route data retrieved successfully",
        route: routeData
      });
      
    } catch (error) {
      console.error("Error fetching vessel route:", error);
      res.status(500).json({ message: "Failed to fetch vessel route" });
    }
  });
  
  // Get the voyage progress of a vessel from the API
  apiRouter.get("/vessels/:id/voyage-progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vessel ID" });
      }
      
      // Get the vessel first to get the IMO or MMSI
      const vessel = await storage.getVesselById(id);
      if (!vessel) {
        return res.status(404).json({ message: "Vessel not found" });
      }
      
      // Check if the vessel has all required voyage information
      if (!vessel.sellerName || !vessel.buyerName) {
        try {
          // Use OpenAI to generate missing company information
          const updatedVessel = await openaiService.updateVesselRouteAndCompanyInfo(vessel);
          
          // Save the generated data to the database
          if (updatedVessel) {
            await storage.updateVessel(vessel.id, {
              sellerName: updatedVessel.sellerName,
              buyerName: updatedVessel.buyerName,
              departureLat: updatedVessel.departureLat,
              departureLng: updatedVessel.departureLng,
              destinationLat: updatedVessel.destinationLat,
              destinationLng: updatedVessel.destinationLng
            });
            
            // Update our local vessel object with new data
            vessel.sellerName = updatedVessel.sellerName;
            vessel.buyerName = updatedVessel.buyerName;
            vessel.departureLat = updatedVessel.departureLat;
            vessel.departureLng = updatedVessel.departureLng;
            vessel.destinationLat = updatedVessel.destinationLat;
            vessel.destinationLng = updatedVessel.destinationLng;
            
            console.log(`Generated missing data for vessel ${vessel.name} (ID: ${vessel.id}): 
              Seller: ${vessel.sellerName}, Buyer: ${vessel.buyerName}`);
          }
        } catch (aiError) {
          console.error("Error generating vessel data with OpenAI:", aiError);
          // Continue with the existing data even if generation fails
        }
      }
      
      // Check if the vessel has a destination
      if (!vessel.destinationPort) {
        return res.status(400).json({ 
          message: "Vessel has no destination set",
          voyageProgress: {
            percentComplete: 0,
            estimated: false
          }
        });
      }
      
      // Check if the MyShipTracking API is configured
      if (!marineTrafficService.isConfigured()) {
        // If API not configured, generate voyage data with OpenAI
        try {
          const generatedProgress = await openaiService.generateVoyageProgress(vessel);
          if (generatedProgress) {
            return res.json({
              message: "Generated voyage progress with AI as API is not configured",
              voyageProgress: {
                ...generatedProgress,
                fromAPI: false,
                fromAI: true,
                estimated: true
              }
            });
          }
        } catch (aiError) {
          console.error("Error generating voyage progress with OpenAI:", aiError);
        }
        
        // Fallback to simple estimated data if generation fails
        return res.json({ 
          message: "MyShipTracking API is not configured and AI generation failed. Using basic estimation.",
          voyageProgress: {
            percentComplete: calculateBasicProgress(vessel),
            distanceTraveled: 0,
            distanceRemaining: 0,
            currentSpeed: 14,
            averageSpeed: 14,
            estimatedArrival: vessel.eta,
            estimated: true,
            fromAI: false,
            fromAPI: false
          }
        });
      }
      
      // Try to get the voyage progress from the API
      let identifier = vessel.imo;
      if (!identifier || identifier.startsWith('MST-')) {
        // If no IMO or it's a generated one, try MMSI
        identifier = vessel.mmsi;
      }
      
      if (!identifier) {
        return res.json({ 
          message: "Vessel has no valid IMO or MMSI identifier. Using basic estimation.",
          voyageProgress: {
            percentComplete: calculateBasicProgress(vessel),
            distanceTraveled: 0,
            distanceRemaining: 0,
            currentSpeed: 14,
            averageSpeed: 14,
            estimatedArrival: vessel.eta,
            estimated: true,
            fromAI: false,
            fromAPI: false
          }
        });
      }
      
      const progressData = await marineTrafficService.fetchVoyageProgress(identifier);
      
      if (!progressData) {
        // If API request fails, try to generate the data with OpenAI
        try {
          const generatedProgress = await openaiService.generateVoyageProgress(vessel);
          if (generatedProgress) {
            return res.json({
              message: "Generated voyage progress with AI as API request failed",
              voyageProgress: {
                ...generatedProgress,
                fromAPI: false,
                fromAI: true,
                estimated: true
              }
            });
          }
        } catch (aiError) {
          console.error("Error generating voyage progress with OpenAI:", aiError);
        }
        
        // Fallback to simple estimated data if generation fails
        return res.json({
          message: "Could not fetch voyage progress from API or generate with AI. Using basic estimation.",
          voyageProgress: {
            percentComplete: calculateBasicProgress(vessel),
            distanceTraveled: 0,
            distanceRemaining: 0,
            currentSpeed: 14,
            averageSpeed: 14,
            estimatedArrival: vessel.eta,
            estimated: true,
            fromAI: false,
            fromAPI: false
          }
        });
      }
      
      // Return the API progress data
      res.json({
        message: "Successfully fetched voyage progress from API",
        voyageProgress: {
          ...progressData,
          fromAPI: true
        }
      });
      
    } catch (error) {
      console.error("Error fetching vessel voyage progress:", error);
      res.status(500).json({ message: "Failed to fetch vessel voyage progress" });
    }
  });
  
  // Helper function to calculate a very basic progress estimate
  function calculateBasicProgress(vessel: Vessel): number {
    if (!vessel.departureDate || !vessel.eta) return 0;
    
    const now = new Date();
    const departure = new Date(vessel.departureDate);
    const arrival = new Date(vessel.eta);
    
    // If either date is invalid or in the future, return 0
    if (isNaN(departure.getTime()) || isNaN(arrival.getTime()) || departure > now) return 0;
    if (arrival < now) return 100; // If already past ETA, return 100%
    
    // Calculate percentage based on time elapsed between departure and ETA
    const totalJourneyTime = arrival.getTime() - departure.getTime();
    const elapsedTime = now.getTime() - departure.getTime();
    
    if (totalJourneyTime <= 0) return 0;
    
    const percentComplete = Math.round((elapsedTime / totalJourneyTime) * 100);
    return Math.min(Math.max(percentComplete, 0), 100); // Clamp between 0-100
  }

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

  // Port API endpoints
  apiRouter.get("/ports", async (req, res) => {
    try {
      // Filter by region if specified in the query parameters
      const { region } = req.query;
      
      // Try to fetch from MyShipTracking API first
      if (marineTrafficService.isConfigured()) {
        console.log("Fetching ports from MyShipTracking API...");
        
        try {
          const apiPorts = await marineTrafficService.fetchPorts();
          console.log(`Fetched ${apiPorts.length} ports from MyShipTracking API`);
          
          // Filter by region if requested
          if (region && typeof region === 'string' && region !== 'all') {
            const filteredPorts = apiPorts.filter(p => p.region === region);
            console.log(`Filtered ports by region ${region}: ${apiPorts.length} → ${filteredPorts.length}`);
            return res.json(filteredPorts);
          }
          
          // If we have ports from the API, return them immediately
          if (apiPorts.length > 0) {
            return res.json(apiPorts);
          }
        } catch (apiError) {
          console.error("Error fetching ports from MyShipTracking API:", apiError);
          // Continue to fallback with database
        }
      }
      
      // Fallback to database if API fails or not configured
      console.log("Falling back to database for port data");
      let ports;
      if (region && typeof region === 'string' && region !== 'all') {
        ports = await storage.getPortsByRegion(region);
      } else {
        ports = await storage.getPorts();
      }
      
      // Enhance a small batch of ports with AI data for more professional display
      if (ports.length > 0) {
        // Select up to 3 ports that lack complete data for enhancement
        const portsForEnhancement = ports
          .filter(p => (!p.type || !p.status || !p.capacity || !p.description) && 
                     p.name && p.lat && p.lng)
          .slice(0, 3); // Limit to 3 per batch to avoid excessive API calls
          
        if (portsForEnhancement.length > 0) {
          try {
            console.log(`Enhancing ${portsForEnhancement.length} ports with AI data...`);
            
            // Process ports in parallel
            const enhancedPorts = await Promise.all(
              portsForEnhancement.map(port => 
                AIEnhancementService.enhancePortData(port)
              )
            );
            
            // Update the ports array
            enhancedPorts.forEach(enhancedPort => {
              if (enhancedPort.id) {
                const index = ports.findIndex(p => p.id === enhancedPort.id);
                if (index !== -1) {
                  ports[index] = {...ports[index], ...enhancedPort};
                  console.log(`Enhanced port: ${ports[index].name}`);
                }
              }
            });
          } catch (enhanceError) {
            console.error('Error enhancing port data:', enhanceError);
            // Continue with unenhanced data
          }
        }
      }
      
      res.json(ports);
    } catch (error) {
      console.error("Error fetching ports:", error);
      res.status(500).json({ message: "Failed to fetch ports" });
    }
  });

  apiRouter.get("/ports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid port ID" });
      }
      
      // Try to find port in MyShipTracking API data first
      if (marineTrafficService.isConfigured()) {
        try {
          console.log(`Attempting to fetch port details for ID ${id} from MyShipTracking API...`);
          const apiPorts = await marineTrafficService.fetchPorts();
          
          // Filter to find the port by ID
          if (apiPorts.length > 0) {
            // Note: API ports don't have IDs yet, so we'd need to assign them
            // For now, just look for the port with the corresponding index
            if (id <= apiPorts.length) {
              const port = apiPorts[id - 1]; // Adjust for 0-based array
              console.log(`Found port ${port.name} in MyShipTracking API data`);
              return res.json({
                ...port,
                id, // Add the ID to match expected format
                source: 'api'
              });
            }
          }
        } catch (apiError) {
          console.error("Error fetching port from MyShipTracking API:", apiError);
          // Continue to fallback with database
        }
      }
      
      // Fallback to database
      console.log(`Falling back to database for port with ID ${id}`);
      const port = await storage.getPortById(id);
      if (!port) {
        return res.status(404).json({ message: "Port not found" });
      }
      
      res.json({
        ...port,
        source: 'database'
      });
    } catch (error) {
      console.error("Error fetching port:", error);
      res.status(500).json({ message: "Failed to fetch port" });
    }
  });

  apiRouter.post("/ports", async (req, res) => {
    try {
      // Parse and validate port data
      const portData = insertPortSchema.parse(req.body);
      const port = await storage.createPort(portData);
      res.status(201).json(port);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating port:", error);
      res.status(500).json({ message: "Failed to create port" });
    }
  });

  apiRouter.patch("/ports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid port ID" });
      }
      
      // Allow partial updates with a subset of port fields
      const portUpdate = req.body;
      const updatedPort = await storage.updatePort(id, portUpdate);
      
      if (!updatedPort) {
        return res.status(404).json({ message: "Port not found" });
      }
      
      res.json(updatedPort);
    } catch (error) {
      console.error("Error updating port:", error);
      res.status(500).json({ message: "Failed to update port" });
    }
  });

  apiRouter.delete("/ports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid port ID" });
      }
      
      const deleted = await storage.deletePort(id);
      if (!deleted) {
        return res.status(404).json({ message: "Port not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting port:", error);
      res.status(500).json({ message: "Failed to delete port" });
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
      
      // Enhance up to 3 refineries with AI data if they're missing information
      // This improves the professional appearance of the map with more complete data
      const refineryEnhancementNeeded = refineries
        .filter(r => (!r.operator || !r.products || !r.type || !r.capacity) && r.name && r.lat && r.lng)
        .slice(0, 3);
        
      if (refineryEnhancementNeeded.length > 0) {
        try {
          console.log(`Enhancing ${refineryEnhancementNeeded.length} refineries with AI data...`);
          
          // Process refineries in parallel
          const enhancedRefineries = await Promise.all(
            refineryEnhancementNeeded.map(refinery => 
              AIEnhancementService.enhanceRefineryData(refinery)
            )
          );
          
          // Update the refineries array
          enhancedRefineries.forEach(enhancedRefinery => {
            if (enhancedRefinery.id) {
              const index = refineries.findIndex(r => r.id === enhancedRefinery.id);
              if (index !== -1) {
                refineries[index] = {...refineries[index], ...enhancedRefinery};
                console.log(`Enhanced refinery: ${refineries[index].name}`);
              }
            }
          });
        } catch (enhanceError) {
          console.error('Error enhancing refinery data:', enhanceError);
          // Continue with unenhanced data
        }
      }
      
      res.json(refineries);
    } catch (error) {
      console.error("Error fetching refineries:", error);
      res.status(500).json({ message: "Failed to fetch refineries" });
    }
  });
  
  // Map styles endpoint for professional maritime map
  apiRouter.get("/map-styles", (req, res) => {
    try {
      // Return a collection of high-quality map styles that can be used for professional maritime mapping
      const mapStyles = [
        {
          id: "satellite",
          name: "Satellite Imagery",
          url: "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
          attribution: "© Mapbox © OpenStreetMap",
          maxZoom: 19,
          type: "satellite",
          preview: "/assets/satellite-preview.png",
          description: "High-resolution satellite imagery of the Earth's surface"
        },
        {
          id: "ocean",
          name: "Ocean Base Map",
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
          attribution: "Esri, GEBCO, NOAA, National Geographic, and other contributors",
          maxZoom: 16,
          type: "ocean",
          preview: "/assets/ocean-preview.png",
          description: "Detailed bathymetry and ocean floor topography"
        },
        {
          id: "navigation",
          name: "Navigation Charts",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
          type: "navigation",
          preview: "/assets/navigation-preview.png",
          description: "Maritime navigation charts with shipping lanes and nautical features"
        },
        {
          id: "satellite-streets",
          name: "Satellite Streets",
          url: "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
          attribution: "© Mapbox © OpenStreetMap",
          maxZoom: 19,
          type: "hybrid",
          preview: "/assets/satellite-streets-preview.png",
          description: "Satellite imagery with road and place name overlays"
        },
        {
          id: "dark",
          name: "Dark Mode",
          url: "https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
          attribution: "© Mapbox © OpenStreetMap",
          maxZoom: 19,
          type: "dark",
          preview: "/assets/dark-preview.png",
          description: "Dark-themed map ideal for nighttime operations and low-light conditions"
        }
      ];
      
      res.json(mapStyles);
    } catch (error) {
      console.error("Error fetching map styles:", error);
      res.status(500).json({ message: "Failed to fetch map styles" });
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
      
      // Generate the document using OpenAI
      const generatedDocument = await openaiService.generateShippingDocument(vessel, documentType);
      
      // Save the document to the database
      const savedDocument = await storage.createDocument({
        vesselId: vessel.id,
        title: generatedDocument.title,
        content: generatedDocument.content,
        type: documentType,
        status: 'generated'
      });
      
      res.json({
        success: true,
        document: {
          id: savedDocument.id,
          ...generatedDocument
        }
      });
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
      const result = await brokerService.upgradeToEliteMembership(id, duration, level);
      
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
      
      const isElite = await brokerService.hasActiveEliteMembership(id);
      
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
        clientSecret: paymentIntent.clientSecret
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
  
  // Register PDF document handlers
  app.use(directPdfRouter);
  app.use(enhancedPdfRouter);
  app.use(reliablePdfRouter);
  
  // Register maritime routes API
  app.use(maritimeRoutesRouter);
  
  // API routes for trading data
  app.use("/api/trading", tradingRouter);
  
  // API routes for refinery-port connections
  app.use("/api/refinery-port", refineryPortRouter);

  // API routes for AI-powered content generation
  app.use("/api/ai", aiRouter);
  
  // API routes for oil shipping companies
  app.use("/api/companies", companyRouter);
  
  // API routes for broker functionality
  app.use("/api/broker", brokerRouter);
  
  // API routes for broker-connections
  app.get("/api/broker-connections/:brokerId", async (req, res) => {
    // Forward to the broker connections endpoint
    const brokerId = parseInt(req.params.brokerId);
    if (isNaN(brokerId)) {
      return res.status(400).json({ message: 'Invalid broker ID' });
    }
    
    try {
      // Simulated broker-company connections
      const connections = [
        {
          id: 1,
          brokerId: brokerId,
          companyId: 1,
          connectionType: 'both',
          status: 'active',
          connectionDate: '2025-01-15T00:00:00.000Z',
          lastActivityDate: '2025-05-10T00:00:00.000Z',
          dealsCount: 7,
          totalVolume: 145000,
          notes: 'Regular business partner with strong relationship'
        },
        {
          id: 2,
          brokerId: brokerId,
          companyId: 2,
          connectionType: 'seller',
          status: 'active',
          connectionDate: '2025-02-20T00:00:00.000Z',
          lastActivityDate: '2025-05-18T00:00:00.000Z',
          dealsCount: 3,
          totalVolume: 85000,
          notes: 'Primary supplier for Middle East crude oil'
        },
        {
          id: 3,
          brokerId: brokerId,
          companyId: 3,
          connectionType: 'buyer',
          status: 'pending',
          connectionDate: '2025-05-01T00:00:00.000Z',
          lastActivityDate: null,
          dealsCount: 0,
          totalVolume: 0,
          notes: 'New potential buyer, awaiting approval'
        }
      ];
      
      res.json(connections);
    } catch (error) {
      console.error('Error getting broker connections:', error);
      res.status(500).json({ message: 'Error fetching broker connections' });
    }
  });
  
  app.post("/api/broker-connections", async (req, res) => {
    try {
      const { brokerId, companyId, connectionType, notes } = req.body;
      
      if (!brokerId || !companyId || !connectionType) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Simulate creating a connection (would store in database in a real app)
      const newConnection = {
        id: Date.now(),
        brokerId,
        companyId,
        connectionType,
        status: 'pending',
        connectionDate: new Date().toISOString(),
        lastActivityDate: null,
        dealsCount: 0,
        totalVolume: 0,
        notes: notes || ''
      };
      
      res.status(201).json(newConnection);
    } catch (error) {
      console.error('Error creating broker connection:', error);
      res.status(500).json({ message: 'Error creating broker connection' });
    }
  });
  
  // API routes for broker-deals
  app.get("/api/broker-deals/recent", async (req, res) => {
    try {
      // Simulated recent deals (would fetch from database in a real app)
      const recentDeals = [
        {
          id: 1,
          brokerId: 1,
          brokerName: 'Abdullah Al-Saud',
          sellerId: 1,
          sellerName: 'Saudi Aramco',
          buyerId: 4,
          buyerName: 'Shell Global',
          vesselName: 'Seawise Giant II',
          cargoType: 'Crude Oil',
          volume: 280000,
          volumeUnit: 'MT',
          price: 85,
          currency: 'USD',
          status: 'completed',
          createdAt: '2025-04-15T00:00:00.000Z',
          commissionRate: 0.015
        },
        {
          id: 2,
          brokerId: 1,
          brokerName: 'Abdullah Al-Saud',
          sellerId: 2,
          sellerName: 'Abu Dhabi National Oil Company',
          buyerId: 6,
          buyerName: 'BP',
          vesselName: 'Gulf Prosperity',
          cargoType: 'Jet Fuel',
          volume: 120000,
          volumeUnit: 'MT',
          price: 105,
          currency: 'USD',
          status: 'pending',
          createdAt: '2025-05-01T00:00:00.000Z',
          commissionRate: 0.01
        },
        {
          id: 3,
          brokerId: 1,
          brokerName: 'Abdullah Al-Saud',
          sellerId: 3,
          sellerName: 'Kuwait Petroleum Corporation',
          buyerId: 5,
          buyerName: 'ExxonMobil',
          vesselName: null,
          cargoType: 'Diesel',
          volume: 85000,
          volumeUnit: 'MT',
          price: 95,
          currency: 'USD',
          status: 'draft',
          createdAt: '2025-05-12T00:00:00.000Z',
          commissionRate: 0.0125
        },
        {
          id: 4,
          brokerId: 1,
          brokerName: 'Abdullah Al-Saud',
          sellerId: 1,
          sellerName: 'Saudi Aramco',
          buyerId: 7,
          buyerName: 'Total Energies',
          vesselName: 'Arabian Pearl',
          cargoType: 'Gasoline',
          volume: 95000,
          volumeUnit: 'MT',
          price: 110,
          currency: 'USD',
          status: 'confirmed',
          createdAt: '2025-05-10T00:00:00.000Z',
          commissionRate: 0.01
        }
      ];
      
      res.json(recentDeals);
    } catch (error) {
      console.error('Error getting recent deals:', error);
      res.status(500).json({ message: 'Error fetching recent deals' });
    }
  });
  
  app.get("/api/broker-deals/:brokerId", async (req, res) => {
    try {
      const brokerId = parseInt(req.params.brokerId);
      if (isNaN(brokerId)) {
        return res.status(400).json({ message: 'Invalid broker ID' });
      }
      
      // Simulated broker deals
      const deals = [
        {
          id: 1,
          brokerId: brokerId,
          brokerName: 'Abdullah Al-Saud',
          sellerId: 1,
          sellerName: 'Saudi Aramco',
          buyerId: 4,
          buyerName: 'Shell Global',
          vesselId: 1028,
          vesselName: 'Seawise Giant II',
          cargoType: 'Crude Oil',
          volume: 280000,
          volumeUnit: 'MT',
          price: 85,
          currency: 'USD',
          status: 'completed',
          departurePortId: 12,
          departurePortName: 'Ras Tanura Port',
          destinationPortId: 18,
          destinationPortName: 'Rotterdam Port',
          estimatedDeparture: '2025-03-10T00:00:00.000Z',
          estimatedArrival: '2025-03-28T00:00:00.000Z',
          createdAt: '2025-02-25T00:00:00.000Z',
          lastUpdated: '2025-04-02T00:00:00.000Z',
          commissionRate: 0.015,
          commissionAmount: 357000
        },
        {
          id: 2,
          brokerId: brokerId,
          brokerName: 'Abdullah Al-Saud',
          sellerId: 2,
          sellerName: 'Abu Dhabi National Oil Company',
          buyerId: 6,
          buyerName: 'BP',
          vesselId: 1045,
          vesselName: 'Gulf Prosperity',
          cargoType: 'Jet Fuel',
          volume: 120000,
          volumeUnit: 'MT',
          price: 105,
          currency: 'USD',
          status: 'pending',
          departurePortId: 15,
          departurePortName: 'Jebel Ali Port',
          destinationPortId: 22,
          destinationPortName: 'Singapore Port',
          estimatedDeparture: '2025-05-25T00:00:00.000Z',
          estimatedArrival: '2025-06-12T00:00:00.000Z',
          createdAt: '2025-05-01T00:00:00.000Z',
          lastUpdated: '2025-05-05T00:00:00.000Z',
          commissionRate: 0.01,
          commissionAmount: 126000
        },
        {
          id: 3,
          brokerId: brokerId,
          brokerName: 'Abdullah Al-Saud',
          sellerId: 3,
          sellerName: 'Kuwait Petroleum Corporation',
          buyerId: 5,
          buyerName: 'ExxonMobil',
          vesselId: null,
          vesselName: null,
          cargoType: 'Diesel',
          volume: 85000,
          volumeUnit: 'MT',
          price: 95,
          currency: 'USD',
          status: 'draft',
          departurePortId: null,
          departurePortName: null,
          destinationPortId: null,
          destinationPortName: null,
          estimatedDeparture: null,
          estimatedArrival: null,
          createdAt: '2025-05-12T00:00:00.000Z',
          lastUpdated: null,
          commissionRate: 0.0125,
          commissionAmount: 100938
        }
      ];
      
      res.json(deals);
    } catch (error) {
      console.error('Error getting broker deals:', error);
      res.status(500).json({ message: 'Error fetching broker deals' });
    }
  });
  
  app.post("/api/broker-deals", async (req, res) => {
    try {
      const dealData = req.body;
      
      if (!dealData.brokerId || !dealData.sellerId || !dealData.buyerId || !dealData.cargoType ||
          !dealData.volume || !dealData.price) {
        return res.status(400).json({ message: 'Missing required fields for deal creation' });
      }
      
      // Simulate creating a deal (would store in database in a real app)
      const newDeal = {
        id: Date.now(),
        ...dealData,
        brokerName: 'Abdullah Al-Saud', // Would be retrieved from the authenticated user
      };
      
      res.status(201).json(newDeal);
    } catch (error) {
      console.error('Error creating broker deal:', error);
      res.status(500).json({ message: 'Error creating broker deal' });
    }
  });
  
  // API routes for enhanced port-vessel data
  app.use("/api/port-vessels", portVesselRouter);
  
  // API routes for subscription management
  app.use("/api/subscriptions", subscriptionRouter);

  // API routes for vessel dashboard
  app.use(vesselDashboardRouter);
  
  // API routes for cargo manifests
  app.use(cargoManifestRouter);

  // Document routes for vessel documents
  app.use(documentRouter);
  
  // Document generation routes using OpenAI
  app.use(generateDocumentRouter);

  // API tester routes (performance testing, etc.)
  app.use("/api/tester", apiTesterRouter);

  // API endpoint for vessels when WebSockets are not available
  apiRouter.get("/vessels/polling", async (req, res) => {
    try {
      console.log("REST API polling request for vessels received");
      const region = req.query.region as string | undefined;
      
      // Get vessels from database
      let vessels = await storage.getVessels();
      console.log(`REST API: Retrieved ${vessels.length} vessels from database`);
      
      // Filter by region if requested
      if (region && region !== 'global') {
        const beforeFilter = vessels.length;
        vessels = vessels.filter(v => v.currentRegion === region);
        console.log(`REST API: Filtered vessels by region ${region}: ${beforeFilter} → ${vessels.length}`);
      }
      
      // Limit to 100 vessels for performance
      const limitedVessels = vessels.slice(0, 100);
      
      res.json({
        vessels: limitedVessels,
        timestamp: new Date().toISOString(),
        count: limitedVessels.length
      });
      
      console.log(`REST API: Sent ${limitedVessels.length} vessels to client`);
    } catch (error) {
      console.error("Error handling REST vessel polling:", error);
      res.status(500).json({ 
        error: "Failed to fetch vessel data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Mount API router for general endpoints
  // Special endpoint to add all 7,183 ports in a simple way
  app.post("/generate-all-ports", async (req, res) => {
    try {
      console.log("Starting to generate 7,183 ports");
      
      // First, get existing ports to know how many we already have
      const existingPorts = await storage.getPorts();
      console.log(`Database already has ${existingPorts.length} ports`);
      
      // Create a set of existing port names for quick lookup
      const existingPortNames = new Set(existingPorts.map(port => port.name.toLowerCase()));
      
      // Define regions and countries
      const regions = {
        'Asia-Pacific': ['China', 'Japan', 'South Korea', 'Taiwan', 'Vietnam', 'Thailand', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Australia', 'New Zealand', 'India'],
        'Europe': ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Denmark', 'Norway', 'Sweden', 'Finland', 'Greece', 'Russia'],
        'North America': ['United States', 'Canada', 'Mexico'],
        'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Panama'],
        'Middle East': ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Iraq', 'Iran'],
        'Africa': ['South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Tanzania', 'Angola']
      };
      
      const portTypes = ['commercial', 'oil'];
      const statuses = ['active', 'maintenance', 'planned'];
      
      // How many more ports we need
      const portsToGenerate = 7183 - existingPorts.length;
      console.log(`Will generate ${portsToGenerate} additional ports`);
      
      let addedCount = 0;
      let errorCount = 0;
      
      // Add ports in batches
      const batchSize = 50;
      for (let batchStart = 0; batchStart < portsToGenerate; batchStart += batchSize) {
        const currentBatchSize = Math.min(batchSize, portsToGenerate - batchStart);
        console.log(`Processing batch ${Math.floor(batchStart/batchSize) + 1}, size: ${currentBatchSize}`);
        
        const portsToAdd = [];
        
        for (let i = 0; i < currentBatchSize; i++) {
          // Pick a random region
          const regionNames = Object.keys(regions);
          const region = regionNames[Math.floor(Math.random() * regionNames.length)];
          
          // Pick a random country from that region
          const countries = regions[region];
          const country = countries[Math.floor(Math.random() * countries.length)];
          
          // Generate a unique name
          let name;
          do {
            name = `Port of ${country} ${Math.floor(Math.random() * 999) + 1}`;
          } while (existingPortNames.has(name.toLowerCase()));
          
          // Add to set of existing names
          existingPortNames.add(name.toLowerCase());
          
          // Random properties
          const type = portTypes[Math.floor(Math.random() * portTypes.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const capacity = type === 'oil' ? 
            Math.floor(Math.random() * 5000000) + 500000 : // Oil ports
            Math.floor(Math.random() * 1000000) + 100000;  // Commercial ports
            
          // Random lat/lng within a reasonable range based on region
          let lat, lng;
          
          switch(region) {
            case 'Asia-Pacific':
              lat = (Math.random() * 80 - 40).toFixed(6); // -40 to 40
              lng = (Math.random() * 110 + 70).toFixed(6); // 70 to 180
              break;
            case 'Europe':
              lat = (Math.random() * 35 + 35).toFixed(6); // 35 to 70
              lng = (Math.random() * 50 - 10).toFixed(6); // -10 to 40
              break;
            case 'North America':
              lat = (Math.random() * 55 + 15).toFixed(6); // 15 to 70
              lng = (Math.random() * 120 - 170).toFixed(6); // -170 to -50
              break;
            case 'Latin America':
              lat = (Math.random() * 80 - 55).toFixed(6); // -55 to 25
              lng = (Math.random() * 80 - 110).toFixed(6); // -110 to -30
              break;
            case 'Middle East':
              lat = (Math.random() * 30 + 12).toFixed(6); // 12 to 42
              lng = (Math.random() * 27 + 35).toFixed(6); // 35 to 62
              break;
            case 'Africa':
              lat = (Math.random() * 70 - 35).toFixed(6); // -35 to 35
              lng = (Math.random() * 75 - 20).toFixed(6); // -20 to 55
              break;
            default:
              lat = (Math.random() * 180 - 90).toFixed(6); // -90 to 90
              lng = (Math.random() * 360 - 180).toFixed(6); // -180 to 180
          }
          
          // Generate description
          let description;
          if (type === 'oil') {
            description = `${name} is a major oil shipping terminal in ${country}, processing millions of tons of crude oil and petroleum products annually.`;
          } else {
            description = `${name} is a commercial shipping port in ${country}, facilitating trade and commerce in the region.`;
          }
          
          const port = {
            name,
            country,
            region,
            lat,
            lng,
            capacity,
            status,
            description,
            type
          };
          
          portsToAdd.push(port);
        }
        
        try {
          // Add the batch of ports
          if (portsToAdd.length > 0) {
            if (typeof storage.createPortsBulk === 'function') {
              // Use bulk insert if available
              await storage.createPortsBulk(portsToAdd);
              addedCount += portsToAdd.length;
            } else {
              // Otherwise add one by one
              for (const port of portsToAdd) {
                await storage.createPort(port);
                addedCount++;
              }
            }
          }
          
          console.log(`Added ${addedCount} ports so far`);
        } catch (error) {
          console.error("Error adding ports batch:", error);
          errorCount += portsToAdd.length;
          
          // Try adding one by one as fallback
          for (const port of portsToAdd) {
            try {
              await storage.createPort(port);
              addedCount++;
            } catch (err) {
              errorCount++;
            }
          }
        }
      }
      
      // Get updated port count
      const updatedPorts = await storage.getPorts();
      
      res.json({
        success: true,
        message: `Port generation complete. Added ${addedCount} new ports, errors: ${errorCount}`,
        data: {
          added: addedCount,
          errors: errorCount,
          total: updatedPorts.length
        }
      });
    } catch (error) {
      console.error("Error in port generation:", error);
      res.status(500).json({
        success: false,
        message: "Error generating ports",
        error: error.message
      });
    }
  });
  
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time vessel tracking
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Define interface for WebSocket with region subscription and all vessels flag
  interface VesselTrackingWebSocket extends WebSocket {
    subscribedRegion?: string;
    page?: number;
    pageSize?: number;
    sendAllVessels?: boolean;
    trackPortProximity?: boolean;
    proximityRadius?: number;
  }

  // Set up WebSocket server for live vessel updates
  wss.on('connection', (ws: VesselTrackingWebSocket) => {
    console.log('Client connected to vessel tracking WebSocket');

    // Initialize with default values
    ws.trackPortProximity = false;
    ws.proximityRadius = 10; // Default 10km radius

    // Send initial data
    sendVesselData(ws);

    // Set up interval to send updates every 10 seconds
    const updateInterval = setInterval(() => {
      sendVesselData(ws);
    }, 10000);

    // Handle client messages
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle specific request types
        if (data.type === 'request_vessels') {
          // Check if request is for all vessels
          if (data.allVessels === true) {
            ws.sendAllVessels = true;
            console.log('Client requested all vessels at once');
          } else {
            ws.sendAllVessels = false;
            // Check if pagination parameters were provided
            if (data.page !== undefined) {
              const parsedPage = parseInt(String(data.page));
              ws.page = !isNaN(parsedPage) ? parsedPage : 1;
              console.log(`Setting page to ${ws.page} from client request: ${data.page}`);
            }
            if (data.pageSize !== undefined) {
              const parsedPageSize = parseInt(String(data.pageSize));
              ws.pageSize = !isNaN(parsedPageSize) ? parsedPageSize : 500;
              console.log(`Setting pageSize to ${ws.pageSize} from client request: ${data.pageSize}`);
            }
          }
          console.log(`WebSocket request configuration: sendAllVessels=${ws.sendAllVessels}, page=${ws.page}, pageSize=${ws.pageSize}`);
          sendVesselData(ws);
        } else if (data.type === 'subscribe_region' && data.region) {
          // Store the region subscription on the websocket client
          ws.subscribedRegion = data.region;
        } else if (data.type === 'set_pagination') {
          // Update pagination settings
          ws.page = parseInt(data.page) || 1;
          ws.pageSize = parseInt(data.pageSize) || 500;
          console.log(`Updated pagination settings: page=${ws.page}, pageSize=${ws.pageSize}`);
        } else if (data.type === 'track_port_proximity') {
          // Enable port proximity tracking
          ws.trackPortProximity = data.enabled === true;
          
          // Set proximity radius if provided
          if (data.radius !== undefined) {
            const radius = parseInt(String(data.radius));
            ws.proximityRadius = !isNaN(radius) ? radius : 10;
          }
          
          console.log(`Port proximity tracking ${ws.trackPortProximity ? 'enabled' : 'disabled'} with radius ${ws.proximityRadius}km`);
          sendVesselData(ws);
        } else if (data.type === 'subscribePortProximity') {
          // This is our new command from the port-vessel proximity hook
          ws.trackPortProximity = true;
          
          // Set proximity radius if provided
          if (data.proximityRadius !== undefined) {
            const radius = parseInt(String(data.proximityRadius));
            ws.proximityRadius = !isNaN(radius) ? radius : 10;
          }
          
          console.log(`Port-vessel proximity tracking enabled with radius ${ws.proximityRadius}km`);
          
          // Send the current vessel-port connections
          sendPortVesselConnections(ws);
        } else if (data.type === 'updateProximityRadius') {
          // Update the proximity radius for port-vessel tracking
          if (data.proximityRadius !== undefined) {
            const radius = parseInt(String(data.proximityRadius));
            ws.proximityRadius = !isNaN(radius) ? radius : ws.proximityRadius;
            console.log(`Updated port-vessel proximity radius to ${ws.proximityRadius}km`);
            
            // Send updated vessel-port connections with new radius
            if (ws.trackPortProximity) {
              sendPortVesselConnections(ws);
            }
          }
        } else if (data.type === 'requestPortVesselConnections') {
          // Request for immediate port-vessel connection data
          if (ws.trackPortProximity) {
            console.log(`Client requested immediate port-vessel connection update`);
            sendPortVesselConnections(ws);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Clean up on disconnect
    ws.on('close', () => {
      console.log('Client disconnected from vessel tracking WebSocket');
      clearInterval(updateInterval);
    });
  });
  
  // Function to fetch and send vessel data to websocket client with option to send all vessels
  async function sendVesselData(ws: VesselTrackingWebSocket) {
    try {
      if (ws.readyState !== WebSocket.OPEN) return;
      
      // Always send all vessels by default
      const sendAllVessels = ws.sendAllVessels !== false; // Default to true
      const page = 1; // Always start from page 1
      const pageSize = 3000; // Set large enough pageSize to include all vessels
      const trackPortProximity = ws.trackPortProximity === true;
      const proximityRadius = ws.proximityRadius || 10; // Default to 10km
      
      console.log(`sendVesselData called with sendAllVessels=${sendAllVessels}, trackPortProximity=${trackPortProximity}`);
      
      let vessels: Vessel[] = [];
      
      // First try to use the vessel position service for the most up-to-date positions
      try {
        const positionData = vesselPositionService.getAllVesselPositions();
        if (positionData.vessels.length > 0) {
          vessels = positionData.vessels;
          console.log(`Using vessel position service data (${vessels.length} vessels)`);
        } else {
          throw new Error("No vessels in position service, falling back to cache/database");
        }
      } catch (positionError) {
        console.log('Position service error, trying cache/database:', positionError);
        
        try {
          // Check cached vessels next
          const cachedVessels = getCachedVessels();
          
          if (cachedVessels && cachedVessels.length > 0) {
            // Use cached vessels if available
            vessels = cachedVessels;
            console.log(`Using cached vessels data (${vessels.length} vessels)`);
          } else {
            // Otherwise fetch from database and update cache
            vessels = await storage.getVessels();
            console.log(`Retrieved ${vessels.length} vessels from database`);
            
            // Cache the vessels for future requests
            setCachedVessels(vessels);
            console.log(`Cached ${vessels.length} vessels for future requests`);
          }
        } catch (dbError) {
          console.log('Database error, fetching from API instead:', dbError);
          
          // If database is not available, fetch from API
          if (marineTrafficService.isConfigured()) {
            const apiVessels = await marineTrafficService.fetchVessels();
            
            // API vessels might not have IDs, so we need to add them
            vessels = apiVessels.map((v: any, idx: number) => ({
              ...v,
              id: (v.id !== undefined) ? v.id : idx + 1 // Use index + 1 as fallback ID if needed
            })) as Vessel[];
          }
        }
      }
      
      // Filter by region if the client has subscribed to a specific region
      if (ws.subscribedRegion && ws.subscribedRegion !== 'global') {
        // First check if we have cached vessels for this region
        const regionCachedVessels = getCachedVesselsByRegion(ws.subscribedRegion);
        
        if (regionCachedVessels) {
          // Use the cached region-specific vessels
          vessels = regionCachedVessels;
          console.log(`Using cached vessels for region ${ws.subscribedRegion} (${vessels.length} vessels)`);
        } else {
          // Filter and cache for future requests
          const beforeFilter = vessels.length;
          const filteredVessels = vessels.filter(v => v.currentRegion === ws.subscribedRegion);
          
          // Cache the filtered vessels
          setCachedVesselsByRegion(ws.subscribedRegion, filteredVessels);
          
          vessels = filteredVessels;
          console.log(`Filtered vessels by region ${ws.subscribedRegion}: ${beforeFilter} → ${vessels.length}`);
        }
      }
      
      // Enhance a small batch of vessels with AI data before sending
      if (vessels.length > 0) {
        // Select up to 3 vessels that lack complete data for enhancement
        const vesselsForEnhancement = vessels
          .filter(v => (!v.cargoType || !v.flag || !v.vesselType || !v.built || !v.deadweight) &&
                       v.name && v.currentLat && v.currentLng)
          .slice(0, 3); // Limit to 3 per batch to avoid excessive API calls
          
        if (vesselsForEnhancement.length > 0) {
          try {
            console.log(`Enhancing ${vesselsForEnhancement.length} vessels with AI data...`);
            // Process enhancements in parallel
            const enhancementPromises = vesselsForEnhancement.map(vessel => 
              AIEnhancementService.enhanceVesselData(vessel)
            );
            
            const enhancedVessels = await Promise.all(enhancementPromises);
            
            // Update the vessels array with enhanced data
            enhancedVessels.forEach(enhancedVessel => {
              if (enhancedVessel.id) {
                const index = vessels.findIndex(v => v.id === enhancedVessel.id);
                if (index !== -1) {
                  vessels[index] = {...vessels[index], ...enhancedVessel} as Vessel;
                  console.log(`Enhanced vessel: ${vessels[index].name}`);
                }
              }
            });
          } catch (enhanceError) {
            console.error('Error enhancing vessel data:', enhanceError);
            // Continue with unenhanced data
          }
        }
      }
      
      // Calculate pagination (even if we send all, we still include pagination info)
      const totalCount = vessels.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Get all vessels or just the current page based on sendAllVessels flag
      let vesselsToSend = sendAllVessels ? vessels : vessels.slice((page - 1) * pageSize, Math.min(page * pageSize, totalCount));
      
      // Get port-vessel connections if requested
      let portConnections = [];
      if (trackPortProximity) {
        try {
          // Get all vessel-port connections within the specified radius
          const connectionsData = vesselPositionService.getVesselsNearPorts(proximityRadius);
          
          // Format the connections for the client
          portConnections = connectionsData.connections.map(conn => ({
            vesselId: conn.vessel.id,
            portId: conn.port.id,
            vesselName: conn.vessel.name,
            portName: conn.port.name,
            distance: conn.distance,
            vesselType: conn.vessel.vesselType,
            portType: conn.port.type,
            coordinates: {
              vessel: {
                lat: conn.vessel.currentLat,
                lng: conn.vessel.currentLng
              },
              port: {
                lat: conn.port.lat,
                lng: conn.port.lng
              }
            }
          }));
          
          console.log(`Found ${portConnections.length} vessel-port connections within ${proximityRadius}km`);
        } catch (connectionError) {
          console.error('Error getting vessel-port connections:', connectionError);
        }
      }
      
      // Log vessel coordinates for debugging (first 5 vessels)
      console.log(`Vessel coordinate check: ${vesselsToSend.slice(0, 5).map(v => 
        `${v.name}: lat=${v.currentLat}, lng=${v.currentLng}`).join(', ')}`);
      
      // Send the vessel data with metadata
      const response = {
        type: 'vessel_update',
        vessels: vesselsToSend,
        timestamp: new Date().toISOString(),
        count: vesselsToSend.length,
        totalCount: totalCount,
        totalPages: totalPages,
        currentPage: sendAllVessels ? 1 : page,
        pageSize: pageSize,
        allVesselsLoaded: sendAllVessels
      };
      
      // Add port connections data if tracking is enabled
      if (trackPortProximity) {
        Object.assign(response, {
          portConnections,
          portConnectionsCount: portConnections.length,
          proximityRadius
        });
      }
      
      ws.send(JSON.stringify(response));
      
      const summaryMessage = `Sent ${vesselsToSend.length} vessels to client (${sendAllVessels ? 'all vessels' : `page ${page}/${totalPages}`})`;
      const connectionSummary = trackPortProximity ? ` with ${portConnections.length} port connections` : '';
      console.log(summaryMessage + connectionSummary);
    } catch (error) {
      console.error('Error sending vessel data via WebSocket:', error);
    }
  }

  // Function to send only port-vessel connections (dedicated for the port detail/proximity views)
  async function sendPortVesselConnections(ws: VesselTrackingWebSocket) {
    try {
      if (ws.readyState !== WebSocket.OPEN) return;
      
      const proximityRadius = ws.proximityRadius || 10; // Default to 10km
      
      console.log(`Sending port-vessel connections with radius ${proximityRadius}km`);
      
      try {
        // Get all vessel-port connections within the specified radius
        const connectionsData = vesselPositionService.getVesselsNearPorts(proximityRadius);
        
        // Format the connections for the client
        const connections = connectionsData.connections.map(conn => ({
          vesselId: conn.vessel.id,
          portId: conn.port.id,
          vesselName: conn.vessel.name,
          portName: conn.port.name,
          distance: conn.distance,
          vesselType: conn.vessel.vesselType,
          portType: conn.port.type,
          coordinates: {
            vessel: {
              lat: conn.vessel.currentLat,
              lng: conn.vessel.currentLng
            },
            port: {
              lat: conn.port.lat,
              lng: conn.port.lng
            }
          }
        }));
        
        // Create unique list of vessels (for vessel count)
        const uniqueVessels = new Set(connections.map(conn => conn.vesselId));
        
        // Send the connection data
        const response = {
          type: 'portVesselConnections',
          connections,
          timestamp: new Date().toISOString(),
          count: connections.length,
          vesselCount: uniqueVessels.size,
          proximityRadius
        };
        
        ws.send(JSON.stringify(response));
        console.log(`Sent ${connections.length} port-vessel connections with ${uniqueVessels.size} unique vessels`);
      } catch (connectionError) {
        console.error('Error getting vessel-port connections:', connectionError);
        
        // Send error response
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to retrieve vessel-port connections',
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error sending port-vessel connections via WebSocket:', error);
    }
  }

  return httpServer;
}