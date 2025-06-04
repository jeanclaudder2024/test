import express, { Request, Response } from 'express';
import { db } from '../db';
import { companies, deals, dealDocuments, brokerNotifications } from '../../shared/schema';
import { eq, ilike, or, desc, asc, and, sql } from 'drizzle-orm';
import { insertCompanySchema, insertDealSchema, insertDealDocumentSchema } from '../../shared/schema';

export const companyRouter = express.Router();

// Get all companies with optional search and pagination
companyRouter.get('/', async (req: Request, res: Response) => {
  try {
    // First, ensure the companies table exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT,
        region TEXT,
        website TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await db.execute(sql.raw(createTableQuery));

    // Check if table is empty and insert sample data
    try {
      const checkDataQuery = 'SELECT COUNT(*) as count FROM companies';
      const checkResult = await db.execute(sql.raw(checkDataQuery));
      
      let existingCount = 0;
      if (checkResult && checkResult.rows && checkResult.rows.length > 0) {
        existingCount = Number(checkResult.rows[0].count || 0);
      }
      
      if (existingCount === 0) {
        const sampleCompanies = [
          "('Shell Global', 'Netherlands', 'Europe', 'https://www.shell.com', 'Major international oil company')",
          "('ExxonMobil', 'United States', 'North America', 'https://www.exxonmobil.com', 'American multinational oil and gas corporation')",
          "('BP', 'United Kingdom', 'Europe', 'https://www.bp.com', 'British multinational oil and gas company')",
          "('TotalEnergies', 'France', 'Europe', 'https://www.totalenergies.com', 'French multinational integrated oil and gas company')",
          "('Chevron', 'United States', 'North America', 'https://www.chevron.com', 'American multinational energy corporation')"
        ];
        
        const insertQuery = `
          INSERT INTO companies (name, country, region, website, description) 
          VALUES ${sampleCompanies.join(', ')}
        `;
        await db.execute(sql.raw(insertQuery));
      }
    } catch (seedError) {
      console.log('Data seeding skipped:', seedError);
    }

    const { 
      search = '', 
      page = '1', 
      limit = '10', 
      sortBy = 'name', 
      sortOrder = 'asc',
      companyType = 'all'
    } = req.query as { 
      search?: string; 
      page?: string; 
      limit?: string; 
      sortBy?: string; 
      sortOrder?: string;
      companyType?: string;
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Use basic query without parameters to avoid mismatch
    let baseQuery = 'SELECT id, name, country, region, website, description FROM companies WHERE 1=1';
    
    // Add search if provided (using string interpolation for now)
    if (search) {
      const searchTerm = search.replace(/'/g, "''"); // Escape single quotes
      baseQuery += ` AND (name ILIKE '%${searchTerm}%' OR country ILIKE '%${searchTerm}%' OR region ILIKE '%${searchTerm}%')`;
    }
    
    // Add sorting
    const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const allowedSortColumns = ['name', 'country', 'region'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    baseQuery += ` ORDER BY ${sortColumn} ${orderDirection}`;
    
    // Add pagination
    baseQuery += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const result = await db.execute(sql.raw(baseQuery));

    // Get total count with proper error handling
    let totalCount = 0;
    try {
      let countQuery = 'SELECT COUNT(*) as count FROM companies WHERE 1=1';
      
      if (search) {
        const searchTerm = search.replace(/'/g, "''");
        countQuery += ` AND (name ILIKE '%${searchTerm}%' OR country ILIKE '%${searchTerm}%' OR region ILIKE '%${searchTerm}%')`;
      }
      
      const countResult = await db.execute(sql.raw(countQuery));
      if (countResult && countResult.rows && countResult.rows.length > 0) {
        totalCount = Number(countResult.rows[0].count || 0);
      }
    } catch (countError) {
      console.log('Count query failed, using default:', countError);
      totalCount = result?.rows?.length || 0;
    }

    res.json({
      companies: result?.rows || [],
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
      realCompanies: totalCompanies.filter(c => c.companyType === 'real').length,
      fakeCompanies: totalCompanies.filter(c => c.companyType === 'fake').length,
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

// Get real companies for linking fake companies
companyRouter.get('/real-companies', async (req: Request, res: Response) => {
  try {
    const realCompanies = await db.select()
      .from(companies)
      .where(eq(companies.companyType, 'real'))
      .orderBy(asc(companies.name));

    res.json(realCompanies);
  } catch (error) {
    console.error('Error fetching real companies:', error);
    res.status(500).json({ error: 'Failed to fetch real companies' });
  }
});

// Deal Management Routes

// Create a new deal request
companyRouter.post('/deals', async (req: Request, res: Response) => {
  try {
    const dealData = insertDealSchema.parse(req.body);
    
    // Get the real company ID from the fake company
    const fakeCompany = await db.select()
      .from(companies)
      .where(eq(companies.id, dealData.fakeCompanyId))
      .limit(1);
    
    if (!fakeCompany.length || !fakeCompany[0].linkedCompanyId) {
      return res.status(400).json({ error: 'Invalid fake company or no linked real company' });
    }

    const newDeal = await db.insert(deals).values({
      ...dealData,
      realCompanyId: fakeCompany[0].linkedCompanyId,
    }).returning();

    res.status(201).json(newDeal[0]);
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Get all deals with filtering
companyRouter.get('/deals', async (req: Request, res: Response) => {
  try {
    const { status, brokerId, companyId } = req.query;
    
    let query = db.select({
      deal: deals,
      fakeCompany: {
        id: companies.id,
        name: companies.name,
        companyType: companies.companyType,
      },
    })
    .from(deals)
    .leftJoin(companies, eq(deals.fakeCompanyId, companies.id));

    const conditions = [];
    if (status) conditions.push(eq(deals.status, status as string));
    if (brokerId) conditions.push(eq(deals.brokerId, Number(brokerId)));
    if (companyId) conditions.push(eq(deals.fakeCompanyId, Number(companyId)));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(deals.createdAt));
    res.json(result);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Get deal by ID
companyRouter.get('/deals/:id', async (req: Request, res: Response) => {
  try {
    const dealId = parseInt(req.params.id);
    
    const result = await db.select({
      deal: deals,
      fakeCompany: companies,
    })
    .from(deals)
    .leftJoin(companies, eq(deals.fakeCompanyId, companies.id))
    .where(eq(deals.id, dealId))
    .limit(1);

    if (!result.length) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// Approve a deal (admin only)
companyRouter.patch('/deals/:id/approve', async (req: Request, res: Response) => {
  try {
    const dealId = parseInt(req.params.id);
    const { adminNotes, approvedBy } = req.body;

    const updatedDeal = await db.update(deals)
      .set({
        status: 'approved',
        adminNotes,
        approvedBy,
        approvedAt: new Date(),
        lastUpdated: new Date(),
      })
      .where(eq(deals.id, dealId))
      .returning();

    if (!updatedDeal.length) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Create notification for broker
    const deal = updatedDeal[0];
    await db.insert(brokerNotifications).values({
      brokerId: deal.brokerId,
      dealId: deal.id,
      type: 'deal_approved',
      title: 'Deal Approved',
      message: `Your deal "${deal.title}" has been approved by admin.`,
    });

    res.json(updatedDeal[0]);
  } catch (error) {
    console.error('Error approving deal:', error);
    res.status(500).json({ error: 'Failed to approve deal' });
  }
});

// Reject a deal (admin only)
companyRouter.patch('/deals/:id/reject', async (req: Request, res: Response) => {
  try {
    const dealId = parseInt(req.params.id);
    const { adminNotes, approvedBy } = req.body;

    const updatedDeal = await db.update(deals)
      .set({
        status: 'rejected',
        adminNotes,
        approvedBy,
        lastUpdated: new Date(),
      })
      .where(eq(deals.id, dealId))
      .returning();

    if (!updatedDeal.length) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Create notification for broker
    const deal = updatedDeal[0];
    await db.insert(brokerNotifications).values({
      brokerId: deal.brokerId,
      dealId: deal.id,
      type: 'deal_rejected',
      title: 'Deal Rejected',
      message: `Your deal "${deal.title}" has been rejected. Reason: ${adminNotes || 'No reason provided'}`,
    });

    res.json(updatedDeal[0]);
  } catch (error) {
    console.error('Error rejecting deal:', error);
    res.status(500).json({ error: 'Failed to reject deal' });
  }
});

// Get notifications for a broker
companyRouter.get('/notifications/:brokerId', async (req: Request, res: Response) => {
  try {
    const brokerId = parseInt(req.params.brokerId);
    
    const notifications = await db.select()
      .from(brokerNotifications)
      .where(eq(brokerNotifications.brokerId, brokerId))
      .orderBy(desc(brokerNotifications.createdAt));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
companyRouter.patch('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    const updatedNotification = await db.update(brokerNotifications)
      .set({ isRead: true })
      .where(eq(brokerNotifications.id, notificationId))
      .returning();

    if (!updatedNotification.length) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(updatedNotification[0]);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});