import express, { Request, Response } from 'express';
import { db } from '../db';
import { companies, deals, dealDocuments, brokerNotifications } from '../../shared/schema';
import { eq, ilike, or, desc, asc, and, sql } from 'drizzle-orm';
import { insertCompanySchema, insertDealSchema, insertDealDocumentSchema } from '../../shared/schema';

export const companyRouter = express.Router();

// Get all companies with optional search and pagination
companyRouter.get('/', async (req: Request, res: Response) => {
  try {
    // First, ensure the companies table has all required columns
    const updateTableQuery = `
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT 'real' CHECK (company_type IN ('real', 'fake')),
      ADD COLUMN IF NOT EXISTS linked_company_id INTEGER REFERENCES companies(id),
      ADD COLUMN IF NOT EXISTS is_visible_to_brokers BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS publicly_traded BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS stock_symbol TEXT,
      ADD COLUMN IF NOT EXISTS revenue DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS employees INTEGER,
      ADD COLUMN IF NOT EXISTS founded_year INTEGER,
      ADD COLUMN IF NOT EXISTS ceo TEXT,
      ADD COLUMN IF NOT EXISTS fleet_size INTEGER,
      ADD COLUMN IF NOT EXISTS specialization TEXT,
      ADD COLUMN IF NOT EXISTS headquarters TEXT,
      ADD COLUMN IF NOT EXISTS logo TEXT,
      ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW()
    `;
    
    await db.execute(sql.raw(updateTableQuery));

    // Check if table is empty and insert sample data
    try {
      const checkDataQuery = 'SELECT COUNT(*) as count FROM companies';
      const checkResult = await db.execute(sql.raw(checkDataQuery));
      
      let existingCount = 0;
      if (checkResult && checkResult.rows && checkResult.rows.length > 0) {
        existingCount = Number(checkResult.rows[0].count || 0);
      }
      
      if (existingCount === 0) {
        // Insert real companies first
        const realCompanies = [
          "('ExxonMobil Corporation', 'United States', 'North America', 'https://www.exxonmobil.com', 'American multinational oil and gas corporation', 'real', NULL, true, true, 'XOM', 413680000000, 62000, 1999, 'Darren Woods', 45, 'Integrated Oil & Gas', 'Irving, Texas', NULL)",
          "('Shell plc', 'Netherlands', 'Europe', 'https://www.shell.com', 'British-Dutch multinational oil and gas company', 'real', NULL, true, true, 'SHEL', 386201000000, 82000, 1907, 'Wael Sawan', 38, 'Integrated Oil & Gas', 'London, UK', NULL)",
          "('Saudi Aramco', 'Saudi Arabia', 'Middle East', 'https://www.aramco.com', 'Saudi Arabian national petroleum and natural gas company', 'real', NULL, true, true, '2222.SR', 535200000000, 70000, 1933, 'Amin H. Nasser', 280, 'Crude Oil Production', 'Dhahran, Saudi Arabia', NULL)",
          "('Chevron Corporation', 'United States', 'North America', 'https://www.chevron.com', 'American multinational energy corporation', 'real', NULL, true, true, 'CVX', 162465000000, 45600, 1879, 'Mike Wirth', 33, 'Integrated Oil & Gas', 'San Ramon, California', NULL)",
          "('TotalEnergies SE', 'France', 'Europe', 'https://www.totalenergies.com', 'French multinational integrated oil and gas company', 'real', NULL, true, true, 'TTE', 200318000000, 105000, 1924, 'Patrick Pouyanné', 35, 'Integrated Oil & Gas', 'Courbevoie, France', NULL)"
        ];
        
        await db.execute(sql.raw(`
          INSERT INTO companies (name, country, region, website, description, company_type, linked_company_id, is_visible_to_brokers, publicly_traded, stock_symbol, revenue, employees, founded_year, ceo, fleet_size, specialization, headquarters, logo) 
          VALUES ${realCompanies.join(', ')}
        `));

        // Now insert fake companies linked to real ones
        const fakeCompanies = [
          "('Global Energy Solutions Ltd', 'United Kingdom', 'Europe', 'https://www.globalenergysolutions.com', 'International energy trading and logistics company', 'fake', 1, true, false, NULL, NULL, 150, 2015, 'James Morrison', 8, 'Energy Trading', 'London, UK', NULL)",
          "('Atlantic Oil Partners', 'United States', 'North America', 'https://www.atlanticoilpartners.com', 'Premium oil trading and distribution services', 'fake', 2, true, false, NULL, NULL, 85, 2018, 'Sarah Johnson', 5, 'Oil Trading', 'Houston, Texas', NULL)",
          "('Middle East Energy Corp', 'UAE', 'Middle East', 'https://www.meeenergy.com', 'Regional energy solutions and crude oil trading', 'fake', 3, true, false, NULL, NULL, 200, 2012, 'Ahmed Al-Rashid', 12, 'Crude Oil Trading', 'Dubai, UAE', NULL)",
          "('Pacific Energy Holdings', 'Singapore', 'Asia-Pacific', 'https://www.pacificenergyholdings.com', 'Asian market energy trading specialist', 'fake', 4, true, false, NULL, NULL, 120, 2020, 'Li Wei Chen', 7, 'Regional Trading', 'Singapore', NULL)",
          "('European Oil Consortium', 'Switzerland', 'Europe', 'https://www.europeanoilconsortium.com', 'European market oil and gas trading platform', 'fake', 5, true, false, NULL, NULL, 95, 2017, 'Hans Mueller', 6, 'Market Trading', 'Zurich, Switzerland', NULL)"
        ];

        await db.execute(sql.raw(`
          INSERT INTO companies (name, country, region, website, description, company_type, linked_company_id, is_visible_to_brokers, publicly_traded, stock_symbol, revenue, employees, founded_year, ceo, fleet_size, specialization, headquarters, logo) 
          VALUES ${fakeCompanies.join(', ')}
        `));
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

    // Use full query to get all company fields
    let baseQuery = `SELECT 
      id, name, country, region, website, description, 
      company_type, linked_company_id, is_visible_to_brokers, 
      publicly_traded, stock_symbol, revenue, employees, 
      founded_year, ceo, fleet_size, specialization, 
      headquarters, logo, created_at, last_updated 
    FROM companies WHERE 1=1`;
    
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
      if (countResult && countResult.length > 0) {
        totalCount = Number(countResult[0].count || 0);
      }
    } catch (countError) {
      console.log('Count query failed, using default:', countError);
      totalCount = result?.length || 0;
    }

    res.json({
      companies: result || [],
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
    const data = req.body;
    
    if (!data.name) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    // Prepare the company data with proper null handling
    const companyData = {
      name: data.name,
      country: data.country || null,
      region: data.region || null,
      website: data.website || null,
      description: data.description || null,
      company_type: data.companyType || 'real',
      linked_company_id: data.linkedCompanyId || null,
      is_visible_to_brokers: data.isVisibleToBrokers !== undefined ? data.isVisibleToBrokers : true,
      publicly_traded: data.publiclyTraded !== undefined ? data.publiclyTraded : false,
      stock_symbol: data.stockSymbol || null,
      revenue: data.revenue || null,
      employees: data.employees || null,
      founded_year: data.foundedYear || null,
      ceo: data.ceo || null,
      fleet_size: data.fleetSize || null,
      specialization: data.specialization || null,
      headquarters: data.headquarters || null,
      logo: data.logo || null,
      last_updated: new Date(),
      created_at: new Date()
    };

    const [newCompany] = await db.insert(companies).values(companyData).returning();

    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
});

// Update company
companyRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Prepare the company data with proper null handling
    const companyData = {
      name: data.name,
      country: data.country || null,
      region: data.region || null,
      website: data.website || null,
      description: data.description || null,
      company_type: data.companyType || 'real',
      linked_company_id: data.linkedCompanyId || null,
      is_visible_to_brokers: data.isVisibleToBrokers !== undefined ? data.isVisibleToBrokers : true,
      publicly_traded: data.publiclyTraded !== undefined ? data.publiclyTraded : false,
      stock_symbol: data.stockSymbol || null,
      revenue: data.revenue || null,
      employees: data.employees || null,
      founded_year: data.foundedYear || null,
      ceo: data.ceo || null,
      fleet_size: data.fleetSize || null,
      specialization: data.specialization || null,
      headquarters: data.headquarters || null,
      logo: data.logo || null,
      last_updated: new Date()
    };

    const [updatedCompany] = await db
      .update(companies)
      .set(companyData)
      .where(eq(companies.id, parseInt(id)))
      .returning();

    if (!updatedCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company', details: error.message });
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
    // First ensure deals table exists
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS deals (
        id SERIAL PRIMARY KEY,
        broker_id INTEGER NOT NULL,
        fake_company_id INTEGER NOT NULL,
        real_company_id INTEGER,
        deal_type TEXT NOT NULL DEFAULT 'negotiation',
        status TEXT DEFAULT 'pending',
        title TEXT NOT NULL,
        description TEXT,
        requested_volume DECIMAL(15,2),
        requested_price DECIMAL(15,2),
        deal_value DECIMAL(15,2),
        notes TEXT,
        admin_notes TEXT,
        approved_by INTEGER,
        approved_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        last_updated TIMESTAMP DEFAULT NOW()
      )
    `));

    // For now, return empty deals array since no sample deals exist
    const sampleDeals = [];

    res.json({ deals: sampleDeals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
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
companyRouter.post('/deals/:id/approve', async (req: Request, res: Response) => {
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
companyRouter.post('/deals/:id/reject', async (req: Request, res: Response) => {
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