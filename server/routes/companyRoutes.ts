import express, { Request, Response } from 'express';
import { db } from '../db';
import { companies, deals, dealDocuments, brokerNotifications } from '../../shared/schema';
import { eq, ilike, or, desc, asc, and, sql } from 'drizzle-orm';
import { insertCompanySchema, insertDealSchema, insertDealDocumentSchema } from '../../shared/schema';

export const companyRouter = express.Router();

// Get all companies with optional search and pagination
companyRouter.get('/', async (req: Request, res: Response) => {
  try {
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

    let query = db.select().from(companies);

    // Build filter conditions
    const conditions = [];
    
    // Add search functionality
    if (search) {
      conditions.push(
        or(
          ilike(companies.name, `%${search}%`),
          ilike(companies.country, `%${search}%`),
          ilike(companies.region, `%${search}%`),
          ilike(companies.specialization, `%${search}%`)
        )
      );
    }
    
    // Add company type filter
    if (companyType !== 'all') {
      conditions.push(eq(companies.companyType, companyType));
    }
    
    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add sorting
    const orderDirection = sortOrder === 'desc' ? desc : asc;
    const sortColumn = (companies as any)[sortBy] || companies.name;
    query = query.orderBy(orderDirection(sortColumn));

    // Add pagination
    query = query.limit(limitNum).offset(offset);

    const result = await query;

    // Get total count for pagination with same filters
    let countQuery = db.select({ count: sql`count(*)` }).from(companies);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalCountResult = await countQuery;
    const totalCount = Number(totalCountResult[0]?.count || 0);

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