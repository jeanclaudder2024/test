import express, { Request, Response } from 'express';
import { db } from '../db';
import { companies } from '../../shared/schema';
import { eq, ilike, or, desc, asc } from 'drizzle-orm';
import { insertCompanySchema } from '../../shared/schema';

export const companyRouter = express.Router();

// Get all companies with optional search and pagination
companyRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      search = '', 
      page = '1', 
      limit = '10', 
      sortBy = 'name', 
      sortOrder = 'asc' 
    } = req.query as { 
      search?: string; 
      page?: string; 
      limit?: string; 
      sortBy?: string; 
      sortOrder?: string; 
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(companies);

    // Add search functionality
    if (search) {
      query = query.where(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.country, `%${search}%`),
          ilike(companies.region, `%${search}%`),
          ilike(companies.specialization, `%${search}%`)
        )
      );
    }

    // Add sorting
    const orderDirection = sortOrder === 'desc' ? desc : asc;
    const sortColumn = (companies as any)[sortBy] || companies.name;
    query = query.orderBy(orderDirection(sortColumn));

    // Add pagination
    query = query.limit(limitNum).offset(offset);

    const result = await query;

    // Get total count for pagination
    let countQuery = db.select().from(companies);
    if (search) {
      countQuery = countQuery.where(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.country, `%${search}%`),
          ilike(companies.region, `%${search}%`),
          ilike(companies.specialization, `%${search}%`)
        )
      );
    }
    const totalCount = (await countQuery).length;

    res.json({
      companies: result,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ID
companyRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (company.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create new company
companyRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertCompanySchema.parse(req.body);
    
    const [newCompany] = await db
      .insert(companies)
      .values({
        ...validatedData,
        createdAt: new Date(),
        lastUpdated: new Date()
      })
      .returning();

    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid company data', details: error });
    }
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
companyRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertCompanySchema.partial().parse(req.body);

    const [updatedCompany] = await db
      .update(companies)
      .set({
        ...validatedData,
        lastUpdated: new Date()
      })
      .where(eq(companies.id, parseInt(id)))
      .returning();

    if (!updatedCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid company data', details: error });
    }
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
companyRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [deletedCompany] = await db
      .delete(companies)
      .where(eq(companies.id, parseInt(id)))
      .returning();

    if (!deletedCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully', company: deletedCompany });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

// Get company statistics
companyRouter.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const totalCompanies = await db.select().from(companies);
    
    const stats = {
      total: totalCompanies.length,
      byRegion: totalCompanies.reduce((acc: any, company) => {
        const region = company.region || 'Unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {}),
      bySpecialization: totalCompanies.reduce((acc: any, company) => {
        const spec = company.specialization || 'Unknown';
        acc[spec] = (acc[spec] || 0) + 1;
        return acc;
      }, {}),
      publiclyTraded: totalCompanies.filter(c => c.publiclyTraded).length,
      averageFleetSize: totalCompanies.reduce((sum, c) => sum + (c.fleetSize || 0), 0) / totalCompanies.length || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching company statistics:', error);
    res.status(500).json({ error: 'Failed to fetch company statistics' });
  }
});