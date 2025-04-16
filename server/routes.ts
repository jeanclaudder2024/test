import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vesselService } from "./services/vesselService";
import { refineryService } from "./services/refineryService";
import { aiService } from "./services/aiService";
import { 
  insertVesselSchema, 
  insertRefinerySchema, 
  insertProgressEventSchema,
  insertDocumentSchema,
  insertBrokerSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();

  // Initialize with seed data in development
  if (app.get("env") === "development") {
    apiRouter.post("/seed", async (req, res) => {
      try {
        const vesselResult = await vesselService.seedVesselData();
        const refineryResult = await refineryService.seedRefineryData();
        
        res.json({ 
          success: true, 
          message: "Seed data created successfully",
          data: { ...vesselResult, ...refineryResult }
        });
      } catch (error) {
        console.error("Error seeding data:", error);
        res.status(500).json({ message: "Failed to seed data" });
      }
    });
  }

  // Stats endpoint
  apiRouter.get("/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Vessel endpoints
  apiRouter.get("/vessels", async (req, res) => {
    try {
      const region = req.query.region as string | undefined;
      
      if (region) {
        const vessels = await vesselService.getVesselsByRegion(region);
        res.json(vessels);
      } else {
        const vessels = await vesselService.getAllVessels();
        res.json(vessels);
      }
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

  // Mount API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}