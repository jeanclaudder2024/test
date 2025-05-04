import express, { Request, Response } from "express";
import { storage } from "../storage";
import { insertOilCompanySchema } from "@shared/schema";
import { ZodError } from "zod";
import { eq } from "drizzle-orm";
import { formatZodError } from "../utils/errorFormatters";
import * as oilCompanyService from "../services/oilCompanyService";

const router = express.Router();

// Get all oil companies
router.get("/", async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const region = req.query.region as string | undefined;
    
    // Return filtered oil companies if query params exist
    if (region) {
      const oilCompanies = await oilCompanyService.getOilCompaniesByRegion(region);
      return res.json(oilCompanies);
    }
    
    // Return all oil companies if no filters
    const oilCompanies = await oilCompanyService.getAllOilCompanies();
    res.json(oilCompanies);
  } catch (error) {
    console.error("Error fetching oil companies:", error);
    res.status(500).json({ message: "Failed to fetch oil companies" });
  }
});

// Get an oil company by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const oilCompany = await oilCompanyService.getOilCompanyById(id);
    
    if (!oilCompany) {
      return res.status(404).json({ message: "Oil company not found" });
    }
    
    res.json(oilCompany);
  } catch (error) {
    console.error("Error fetching oil company:", error);
    res.status(500).json({ message: "Failed to fetch oil company" });
  }
});

// Create a new oil company
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const oilCompanyData = insertOilCompanySchema.parse(req.body);
    
    // Create the oil company
    const newOilCompany = await storage.createOilCompany(oilCompanyData);
    
    res.status(201).json(newOilCompany);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Invalid oil company data", 
        errors: formatZodError(error) 
      });
    }
    
    console.error("Error creating oil company:", error);
    res.status(500).json({ message: "Failed to create oil company" });
  }
});

// Update an oil company
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    // Check if oil company exists
    const existingOilCompany = await storage.getOilCompanyById(id);
    
    if (!existingOilCompany) {
      return res.status(404).json({ message: "Oil company not found" });
    }
    
    // Validate partial data with partial schema
    const updateData = insertOilCompanySchema.partial().parse(req.body);
    
    // Update the oil company
    const updatedOilCompany = await storage.updateOilCompany(id, updateData);
    
    res.json(updatedOilCompany);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Invalid oil company data", 
        errors: formatZodError(error) 
      });
    }
    
    console.error("Error updating oil company:", error);
    res.status(500).json({ message: "Failed to update oil company" });
  }
});

// Delete an oil company
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    // Check if oil company exists
    const existingOilCompany = await storage.getOilCompanyById(id);
    
    if (!existingOilCompany) {
      return res.status(404).json({ message: "Oil company not found" });
    }
    
    // Delete the oil company
    const success = await storage.deleteOilCompany(id);
    
    if (success) {
      res.json({ message: "Oil company deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete oil company" });
    }
  } catch (error) {
    console.error("Error deleting oil company:", error);
    res.status(500).json({ message: "Failed to delete oil company" });
  }
});

// Seed oil company data from Excel file
router.post("/seed", async (req: Request, res: Response) => {
  try {
    console.log("Seeding oil companies from Excel file...");
    const result = await oilCompanyService.seedOilCompanyData();
    
    res.json({
      success: true,
      message: result.seeded 
        ? `Successfully seeded ${result.companies} oil companies` 
        : `Database already contains ${result.companies} oil companies`,
      data: {
        companies: result.companies,
        seeded: result.seeded
      }
    });
  } catch (error: any) {
    console.error("Error seeding oil companies:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to seed oil companies",
      error: error.message
    });
  }
});

export const oilCompanyRouter = router;