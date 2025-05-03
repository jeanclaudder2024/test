import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/aiService";
import { brokerService } from "./services/brokerService";
import { stripeService } from "./services/stripeService";
import { setupAuth } from "./auth";
import { db } from "./db";
import { 
  insertDocumentSchema,
  insertBrokerSchema,
  documents,
  stats
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { brokerRouter } from "./routes/brokerRoutes";
import { tradingRouter } from "./routes/tradingRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  const apiRouter = express.Router();

  // Document endpoints
  apiRouter.get("/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
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

  apiRouter.get("/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await db.query.documents.findFirst({
        where: (documents, { eq }) => eq(documents.id, documentId)
      });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // AI Assistant endpoint
  apiRouter.post("/ai/process-query", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const result = await aiService.processQuery(query);
      res.json(result);
    } catch (error) {
      console.error("Error processing AI query:", error);
      res.status(500).json({ 
        message: "Failed to process query", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Document generation endpoint
  apiRouter.post("/documents/generate", async (req, res) => {
    try {
      const { documentType, cargoDetails } = req.body;
      
      if (!documentType) {
        return res.status(400).json({ message: "Document type is required" });
      }
      
      const result = await aiService.generateDocument(0, documentType, cargoDetails);
      res.json(result);
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ 
        message: "Failed to generate document", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Summary stats endpoint
  apiRouter.get("/stats/summary", async (req, res) => {
    try {
      // Get application summary statistics
      const brokers = await storage.getBrokers();
      const documents = await storage.getDocuments();
      
      const summary = {
        activeDocuments: documents.length,
        activeBrokers: brokers.filter(b => b.active).length,
        eliteBrokers: brokers.filter(b => b.eliteMember).length,
        totalDocuments: documents.length
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching summary stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics summary" });
    }
  });

  // Stripe payment endpoint
  apiRouter.post("/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripeService.createPaymentIntent(amount);
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
  
  // API routes for trading data
  app.use("/api/trading", tradingRouter);
  
  // API routes for broker-related operations
  app.use("/api/broker", brokerRouter);

  // Mount API router for general endpoints
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}