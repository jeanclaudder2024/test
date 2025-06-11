import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateToken, requireAdmin, type AuthenticatedRequest } from "./auth";
import { storage } from "./storage";
import { Request, Response } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertRealCompanySchema,
  insertFakeCompanySchema,
  insertBrokerDealSchema,
  insertBrokerDocumentSchema,
  insertOilMarketAlertSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {

  // Real Company Routes
  app.get("/api/admin/real-companies", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const companies = await storage.getRealCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching real companies:", error);
      res.status(500).json({ message: "Failed to fetch real companies" });
    }
  });

  app.post("/api/admin/real-companies", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = insertRealCompanySchema.parse(req.body);
      const company = await storage.createRealCompany(validatedData);
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error creating real company:", error);
      res.status(500).json({ message: "Failed to create real company" });
    }
  });

  // Fake Company Routes
  app.get("/api/admin/fake-companies", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fakeCompanies = await storage.getFakeCompanies();
      const realCompanies = await storage.getRealCompanies();
      
      const companies = fakeCompanies.map(fakeCompany => {
        const realCompany = realCompanies.find(real => real.id === fakeCompany.realCompanyId);
        return {
          ...fakeCompany,
          realCompany
        };
      });
      
      res.json(companies);
    } catch (error) {
      console.error("Error fetching fake companies:", error);
      res.status(500).json({ message: "Failed to fetch fake companies" });
    }
  });

  app.post("/api/admin/fake-companies", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = insertFakeCompanySchema.parse(req.body);
      const company = await storage.createFakeCompany(validatedData);
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error creating fake company:", error);
      res.status(500).json({ message: "Failed to create fake company" });
    }
  });

  // Companies public endpoint
  app.get("/api/companies", async (req: Request, res: Response) => {
    try {
      const fakeCompanies = await storage.getFakeCompanies();
      const realCompanies = await storage.getRealCompanies();
      
      const companies = fakeCompanies.map(fakeCompany => {
        const realCompany = realCompanies.find(real => real.id === fakeCompany.realCompanyId);
        return {
          ...fakeCompany,
          realCompany
        };
      });
      
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Broker Deal Routes
  app.post("/api/broker-deals", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBrokerDealSchema.parse(req.body);
      const deal = await storage.createBrokerDeal(validatedData);
      res.json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error creating broker deal:", error);
      res.status(500).json({ message: "Failed to create broker deal" });
    }
  });

  app.get("/api/broker-deals", async (req: Request, res: Response) => {
    try {
      const deals = await storage.getBrokerDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching broker deals:", error);
      res.status(500).json({ message: "Failed to fetch broker deals" });
    }
  });

  app.patch("/api/broker-deals/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const deal = await storage.updateBrokerDeal(parseInt(id), updates);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error updating broker deal:", error);
      res.status(500).json({ message: "Failed to update broker deal" });
    }
  });

  app.delete("/api/broker-deals/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBrokerDeal(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json({ message: "Deal deleted successfully" });
    } catch (error) {
      console.error("Error deleting broker deal:", error);
      res.status(500).json({ message: "Failed to delete broker deal" });
    }
  });

  // Broker Document Routes
  app.get("/api/broker-documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getBrokerDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching broker documents:", error);
      res.status(500).json({ message: "Failed to fetch broker documents" });
    }
  });

  app.post("/api/broker-documents", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBrokerDocumentSchema.parse(req.body);
      const document = await storage.createBrokerDocument(validatedData);
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error creating broker document:", error);
      res.status(500).json({ message: "Failed to create broker document" });
    }
  });

  app.patch("/api/broker-documents/:id/mark-read", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await storage.updateBrokerDocument(parseInt(id), { isRead: true });
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error marking document as read:", error);
      res.status(500).json({ message: "Failed to mark document as read" });
    }
  });

  app.delete("/api/broker-documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBrokerDocument(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting broker document:", error);
      res.status(500).json({ message: "Failed to delete broker document" });
    }
  });

  // Oil Market Alert Routes
  app.get("/api/oil-market-alerts", async (req: Request, res: Response) => {
    try {
      const alerts = await storage.getOilMarketAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching oil market alerts:", error);
      res.status(500).json({ message: "Failed to fetch oil market alerts" });
    }
  });

  app.post("/api/oil-market-alerts", async (req: Request, res: Response) => {
    try {
      const validatedData = insertOilMarketAlertSchema.parse(req.body);
      const alert = await storage.createOilMarketAlert(validatedData);
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error creating oil market alert:", error);
      res.status(500).json({ message: "Failed to create oil market alert" });
    }
  });

  app.patch("/api/oil-market-alerts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const alert = await storage.updateOilMarketAlert(parseInt(id), updates);
      
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error("Error updating oil market alert:", error);
      res.status(500).json({ message: "Failed to update oil market alert" });
    }
  });

  app.delete("/api/oil-market-alerts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteOilMarketAlert(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json({ message: "Alert deleted successfully" });
    } catch (error) {
      console.error("Error deleting oil market alert:", error);
      res.status(500).json({ message: "Failed to delete oil market alert" });
    }
  });

  // Basic admin brokers endpoint
  app.get("/api/admin/brokers", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      const brokers = users.filter(user => user.role === 'broker');
      res.json(brokers);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      res.status(500).json({ message: "Failed to fetch brokers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}