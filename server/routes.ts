import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "./db";
import { eq, desc, like, sql } from "drizzle-orm";
import { 
  vessels,
  refineries,
  ports,
  brokers,
  companies,
  documents,
  users,
  stats,
  vesselPortConnections,
  insertVesselSchema,
  insertRefinerySchema,
  insertPortSchema,
  insertBrokerSchema,
  insertDocumentSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  
  // WebSocket setup for real-time vessel tracking
  const wss = new WebSocketServer({ server });
  
  // Basic health check
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      await db.select().from(vessels).limit(1);
      res.json({ status: "healthy", database: "connected" });
    } catch (error) {
      res.status(500).json({ status: "unhealthy", database: "disconnected" });
    }
  });

  // Vessel routes
  app.get("/api/vessels", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;
      const region = req.query.region as string;
      
      let queryBuilder = db.select().from(vessels);
      
      if (search) {
        queryBuilder = queryBuilder.where(like(vessels.name, `%${search}%`));
      }
      
      if (region && region !== 'global') {
        queryBuilder = queryBuilder.where(eq(vessels.currentRegion, region));
      }
      
      const allVessels = await queryBuilder.orderBy(desc(vessels.lastUpdated)).limit(limit).offset((page - 1) * limit);
      
      res.json({
        vessels: allVessels,
        pagination: {
          page,
          limit,
          total: allVessels.length
        }
      });
    } catch (error) {
      console.error('Error fetching vessels:', error);
      res.status(500).json({ error: "Failed to fetch vessels" });
    }
  });

  app.get("/api/vessels/:id", async (req: Request, res: Response) => {
    try {
      const vesselId = parseInt(req.params.id);
      const vessel = await db.select().from(vessels).where(eq(vessels.id, vesselId)).limit(1);
      
      if (vessel.length === 0) {
        return res.status(404).json({ error: "Vessel not found" });
      }
      
      res.json(vessel[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vessel" });
    }
  });

  app.post("/api/vessels", async (req: Request, res: Response) => {
    try {
      const vesselData = insertVesselSchema.parse(req.body);
      const result = await db.insert(vessels).values([vesselData]).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid vessel data" });
    }
  });

  // Port routes
  app.get("/api/ports", async (req: Request, res: Response) => {
    try {
      const allPorts = await db.select().from(ports).orderBy(ports.name);
      res.json(allPorts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ports" });
    }
  });

  app.get("/api/ports/:id", async (req: Request, res: Response) => {
    try {
      const portId = parseInt(req.params.id);
      const port = await db.select().from(ports).where(eq(ports.id, portId)).limit(1);
      
      if (port.length === 0) {
        return res.status(404).json({ error: "Port not found" });
      }
      
      res.json(port[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch port" });
    }
  });

  // Refinery routes
  app.get("/api/refineries", async (req: Request, res: Response) => {
    try {
      const allRefineries = await db.select().from(refineries).orderBy(refineries.name);
      res.json(allRefineries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch refineries" });
    }
  });

  app.get("/api/refineries/:id", async (req: Request, res: Response) => {
    try {
      const refineryId = parseInt(req.params.id);
      const refinery = await db.select().from(refineries).where(eq(refineries.id, refineryId)).limit(1);
      
      if (refinery.length === 0) {
        return res.status(404).json({ error: "Refinery not found" });
      }
      
      res.json(refinery[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch refinery" });
    }
  });

  // Broker routes
  app.get("/api/brokers", async (req: Request, res: Response) => {
    try {
      const allBrokers = await db.select().from(brokers).orderBy(brokers.name);
      res.json(allBrokers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brokers" });
    }
  });

  // Company routes
  app.get("/api/companies", async (req: Request, res: Response) => {
    try {
      const allCompanies = await db.select().from(companies).orderBy(companies.name);
      res.json(allCompanies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Document routes
  app.get("/api/vessels/:id/documents", async (req: Request, res: Response) => {
    try {
      const vesselId = parseInt(req.params.id);
      const vesselDocuments = await db.select().from(documents).where(eq(documents.vesselId, vesselId));
      res.json(vesselDocuments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const vesselCount = await db.select({ count: sql<number>`count(*)` }).from(vessels);
      const portCount = await db.select({ count: sql<number>`count(*)` }).from(ports);
      const refineryCount = await db.select({ count: sql<number>`count(*)` }).from(refineries);
      const brokerCount = await db.select({ count: sql<number>`count(*)` }).from(brokers);
      
      res.json({
        vessels: vesselCount[0]?.count || 0,
        ports: portCount[0]?.count || 0,
        refineries: refineryCount[0]?.count || 0,
        brokers: brokerCount[0]?.count || 0
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Simple seed route
  app.post("/api/seed", async (req: Request, res: Response) => {
    try {
      // Basic seeding - can be expanded
      res.json({ success: true, message: "Seed data process completed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  // Simple WebSocket connection for real-time updates
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');
    
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        // Echo back simple response
        ws.send(JSON.stringify({ type: 'response', received: true }));
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return server;
}