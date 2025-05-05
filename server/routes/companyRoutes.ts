import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertCompanySchema } from '@shared/schema';
import { z } from 'zod';

export const companyRouter = Router();

// Get all companies
companyRouter.get('/', async (req: Request, res: Response) => {
  try {
    const companies = await storage.getCompanies();
    res.json(companies);
  } catch (error) {
    console.error('Error getting companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// Get companies by region
companyRouter.get('/region/:region', async (req: Request, res: Response) => {
  try {
    const region = req.params.region;
    if (!region) {
      return res.status(400).json({ message: 'Region is required' });
    }
    
    const companies = await storage.getCompaniesByRegion(region);
    res.json(companies);
  } catch (error) {
    console.error('Error getting companies by region:', error);
    res.status(500).json({ message: 'Error fetching companies by region' });
  }
});

// Get company by ID
companyRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const company = await storage.getCompanyById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error getting company by ID:', error);
    res.status(500).json({ message: 'Error fetching company' });
  }
});

// Create a new company
companyRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const result = insertCompanySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid company data', errors: result.error.format() });
    }
    
    const company = await storage.createCompany(result.data);
    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Error creating company' });
  }
});

// Import multiple companies at once
companyRouter.post('/import', async (req: Request, res: Response) => {
  try {
    // Define validation schema for the request
    const importSchema = z.object({
      companies: z.array(insertCompanySchema)
    });
    
    // Validate the request body
    const result = importSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid import data', errors: result.error.format() });
    }
    
    // Import the companies
    const companies = await storage.createCompaniesBulk(result.data.companies);
    
    res.status(201).json({ 
      message: 'Companies imported successfully',
      count: companies.length,
      companies 
    });
  } catch (error) {
    console.error('Error importing companies:', error);
    res.status(500).json({ message: 'Error importing companies' });
  }
});

// Update a company
companyRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    // Validate the request body
    const result = insertCompanySchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid company data', errors: result.error.format() });
    }
    
    const company = await storage.updateCompany(id, result.data);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Error updating company' });
  }
});

// Delete a company
companyRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid company ID' });
    }
    
    const success = await storage.deleteCompany(id);
    if (!success) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Error deleting company' });
  }
});