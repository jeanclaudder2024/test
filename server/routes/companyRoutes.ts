import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertCompanySchema } from "@shared/schema";
import { z } from "zod";

export const companyRouter = Router();

/**
 * @route GET /api/companies
 * @description Get all shipping companies
 * @access Public
 */
companyRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const companies = await storage.getCompanies();
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

/**
 * @route GET /api/companies/:id
 * @description Get a shipping company by ID
 * @access Public
 */
companyRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const company = await storage.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ message: "Failed to fetch company" });
  }
});

/**
 * @route GET /api/companies/region/:region
 * @description Get all shipping companies by region
 * @access Public
 */
companyRouter.get("/region/:region", async (req: Request, res: Response) => {
  try {
    const region = req.params.region;
    const companies = await storage.getCompaniesByRegion(region);
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies by region:", error);
    res.status(500).json({ message: "Failed to fetch companies by region" });
  }
});

/**
 * @route POST /api/companies
 * @description Create a new shipping company
 * @access Public
 */
companyRouter.post("/", async (req: Request, res: Response) => {
  try {
    const companyData = insertCompanySchema.parse(req.body);
    const newCompany = await storage.createCompany(companyData);
    res.status(201).json(newCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid company data", errors: error.errors });
    }
    console.error("Error creating company:", error);
    res.status(500).json({ message: "Failed to create company" });
  }
});

/**
 * @route POST /api/companies/bulk
 * @description Create multiple shipping companies in bulk
 * @access Public
 */
companyRouter.post("/bulk", async (req: Request, res: Response) => {
  try {
    const companiesData = req.body;
    if (!Array.isArray(companiesData)) {
      return res.status(400).json({ message: "Expected an array of companies" });
    }

    // Validate each company
    const validatedCompanies = [];
    const errors = [];

    for (let i = 0; i < companiesData.length; i++) {
      try {
        const companyData = insertCompanySchema.parse(companiesData[i]);
        validatedCompanies.push(companyData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({ index: i, errors: error.errors });
        } else {
          errors.push({ index: i, message: "Unknown validation error" });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: "Invalid data for some companies", 
        errors,
        validCount: validatedCompanies.length,
        totalCount: companiesData.length
      });
    }

    const newCompanies = await storage.createCompaniesBulk(validatedCompanies);
    res.status(201).json({
      message: `Successfully created ${newCompanies.length} companies`,
      companies: newCompanies
    });
  } catch (error) {
    console.error("Error creating companies in bulk:", error);
    res.status(500).json({ message: "Failed to create companies in bulk" });
  }
});

/**
 * @route PATCH /api/companies/:id
 * @description Update a shipping company
 * @access Public
 */
companyRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const companyData = req.body;
    const updatedCompany = await storage.updateCompany(id, companyData);
    
    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Failed to update company" });
  }
});

/**
 * @route DELETE /api/companies/:id
 * @description Delete a shipping company
 * @access Public
 */
companyRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Check if company exists
    const company = await storage.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    await storage.deleteCompany(id);
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ message: "Failed to delete company" });
  }
});

/**
 * @route POST /api/companies/import-excel
 * @description Import companies from Excel data
 * @access Public
 */
companyRouter.post("/import-excel", async (req: Request, res: Response) => {
  try {
    const { companies } = req.body;
    
    if (!Array.isArray(companies) || companies.length === 0) {
      return res.status(400).json({ message: "Invalid or empty companies data" });
    }

    // Transform the data to match our schema
    const transformedCompanies = companies.map(company => ({
      name: company.name || company.Name || "",
      country: company.country || company.Country || "",
      region: company.region || company.Region || "",
      headquarters: company.headquarters || company.Headquarters || company.HQ || "",
      foundedYear: company.foundedYear || company.FoundedYear || company.Founded || null,
      ceo: company.ceo || company.CEO || "",
      fleetSize: company.fleetSize || company.FleetSize || null,
      specialization: company.specialization || company.Specialization || "",
      website: company.website || company.Website || "",
      logo: company.logo || company.Logo || "",
      description: company.description || company.Description || "",
      revenue: company.revenue || company.Revenue || null,
      employees: company.employees || company.Employees || null,
      publiclyTraded: Boolean(company.publiclyTraded || company.PubliclyTraded),
      stockSymbol: company.stockSymbol || company.StockSymbol || "",
      status: "active"
    }));

    // Create the companies in the database
    const createdCompanies = await storage.createCompaniesBulk(transformedCompanies);
    
    res.status(201).json({
      message: `Successfully imported ${createdCompanies.length} companies`,
      count: createdCompanies.length,
      companies: createdCompanies
    });
  } catch (error) {
    console.error("Error importing companies from Excel:", error);
    res.status(500).json({ message: "Failed to import companies from Excel" });
  }
});