import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertOilCompanySchema } from "@shared/schema";
import { z } from "zod";

export const oilCompanyRouter = Router();

/**
 * @route GET /api/oil-companies
 * @description Get all oil companies
 * @access Public
 */
oilCompanyRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const companies = await storage.getOilCompanies();
    res.json(companies);
  } catch (error) {
    console.error("Error fetching oil companies:", error);
    res.status(500).json({ error: "Failed to fetch oil companies" });
  }
});

/**
 * @route GET /api/oil-companies/:id
 * @description Get oil company by ID
 * @access Public
 */
oilCompanyRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid oil company ID" });
    }

    const company = await storage.getOilCompanyById(id);
    if (!company) {
      return res.status(404).json({ error: "Oil company not found" });
    }

    res.json(company);
  } catch (error) {
    console.error(`Error fetching oil company ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch oil company" });
  }
});

/**
 * @route GET /api/oil-companies/region/:region
 * @description Get oil companies by region
 * @access Public
 */
oilCompanyRouter.get("/region/:region", async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const companies = await storage.getOilCompaniesByRegion(region);
    res.json(companies);
  } catch (error) {
    console.error(`Error fetching oil companies in region ${req.params.region}:`, error);
    res.status(500).json({ error: "Failed to fetch oil companies by region" });
  }
});

/**
 * @route POST /api/oil-companies
 * @description Create a new oil company
 * @access Public
 */
oilCompanyRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertOilCompanySchema.parse(req.body);
    
    // Create oil company
    const company = await storage.createOilCompany(validatedData);
    res.status(201).json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating oil company:", error);
    res.status(500).json({ error: "Failed to create oil company" });
  }
});

/**
 * @route PATCH /api/oil-companies/:id
 * @description Update an oil company
 * @access Public
 */
oilCompanyRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid oil company ID" });
    }

    // Partial validation of request body
    const validatedData = insertOilCompanySchema.partial().parse(req.body);
    
    // Update oil company
    const updatedCompany = await storage.updateOilCompany(id, validatedData);
    if (!updatedCompany) {
      return res.status(404).json({ error: "Oil company not found" });
    }
    
    res.json(updatedCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(`Error updating oil company ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update oil company" });
  }
});

/**
 * @route DELETE /api/oil-companies/:id
 * @description Delete an oil company
 * @access Public
 */
oilCompanyRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid oil company ID" });
    }

    const success = await storage.deleteOilCompany(id);
    if (!success) {
      return res.status(404).json({ error: "Oil company not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting oil company ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete oil company" });
  }
});