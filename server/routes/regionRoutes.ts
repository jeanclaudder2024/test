import { Router, Request, Response } from 'express';
import { db } from '../db';
import { regions, insertRegionSchema } from '../../shared/schema';
import { eq, like, and, desc, asc, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get all regions with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      parentRegion = '',
      isActive = 'true',
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(like(regions.name, `%${search}%`));
    }
    
    if (parentRegion && parentRegion !== 'all') {
      conditions.push(eq(regions.parentRegion, parentRegion as string));
    }
    
    if (isActive !== 'all') {
      conditions.push(eq(regions.isActive, isActive === 'true'));
    }

    // Build sort order
    const orderBy = sortOrder === 'desc' ? desc(regions.sortOrder) : asc(regions.sortOrder);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(regions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const total = totalResult[0]?.count || 0;

    // Get paginated results
    const regionsList = await db
      .select()
      .from(regions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    res.json({
      data: regionsList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// Get region by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const region = await db
      .select()
      .from(regions)
      .where(eq(regions.id, parseInt(id)))
      .limit(1);

    if (region.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json(region[0]);
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({ error: 'Failed to fetch region' });
  }
});

// Create new region
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertRegionSchema.parse(req.body);
    
    const newRegion = await db
      .insert(regions)
      .values(validatedData)
      .returning();

    res.status(201).json(newRegion[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating region:', error);
    res.status(500).json({ error: 'Failed to create region' });
  }
});

// Update region
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertRegionSchema.partial().parse(req.body);
    
    const updatedRegion = await db
      .update(regions)
      .set({ ...validatedData, lastUpdated: new Date() })
      .where(eq(regions.id, parseInt(id)))
      .returning();

    if (updatedRegion.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json(updatedRegion[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating region:', error);
    res.status(500).json({ error: 'Failed to update region' });
  }
});

// Delete region
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedRegion = await db
      .delete(regions)
      .where(eq(regions.id, parseInt(id)))
      .returning();

    if (deletedRegion.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json({ message: 'Region deleted successfully' });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ error: 'Failed to delete region' });
  }
});

// Get parent regions list
router.get('/meta/parent-regions', async (req: Request, res: Response) => {
  try {
    const parentRegions = await db
      .selectDistinct({ parentRegion: regions.parentRegion })
      .from(regions)
      .where(and(eq(regions.isActive, true), sql`${regions.parentRegion} IS NOT NULL`));

    res.json(parentRegions.map(r => r.parentRegion).filter(Boolean));
  } catch (error) {
    console.error('Error fetching parent regions:', error);
    res.status(500).json({ error: 'Failed to fetch parent regions' });
  }
});

// Get region countries
router.get('/:id/countries', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const region = await db
      .select({ countries: regions.countries })
      .from(regions)
      .where(eq(regions.id, parseInt(id)))
      .limit(1);

    if (region.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    const countries = region[0].countries ? JSON.parse(region[0].countries) : [];
    res.json(countries);
  } catch (error) {
    console.error('Error fetching region countries:', error);
    res.status(500).json({ error: 'Failed to fetch region countries' });
  }
});

export default router;