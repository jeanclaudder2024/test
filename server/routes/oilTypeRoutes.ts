import { Router, Request, Response } from 'express';
import { db } from '../db';
import { oilTypes, insertOilTypeSchema } from '../../shared/schema';
import { eq, like, and, desc, asc, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get all oil types with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      category = '', 
      isActive = 'true',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(like(oilTypes.name, `%${search}%`));
    }
    
    if (category && category !== 'all') {
      conditions.push(eq(oilTypes.category, category as string));
    }
    
    if (isActive !== 'all') {
      conditions.push(eq(oilTypes.isActive, isActive === 'true'));
    }

    // Build sort order
    const orderBy = sortOrder === 'desc' ? desc(oilTypes.name) : asc(oilTypes.name);

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(oilTypes)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const total = totalResult[0]?.count || 0;

    // Get paginated results
    const oilTypesList = await db
      .select()
      .from(oilTypes)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    res.json({
      data: oilTypesList,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching oil types:', error);
    res.status(500).json({ error: 'Failed to fetch oil types' });
  }
});

// Get oil type by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const oilType = await db
      .select()
      .from(oilTypes)
      .where(eq(oilTypes.id, parseInt(id)))
      .limit(1);

    if (oilType.length === 0) {
      return res.status(404).json({ error: 'Oil type not found' });
    }

    res.json(oilType[0]);
  } catch (error) {
    console.error('Error fetching oil type:', error);
    res.status(500).json({ error: 'Failed to fetch oil type' });
  }
});

// Create new oil type
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertOilTypeSchema.parse(req.body);
    
    const newOilType = await db
      .insert(oilTypes)
      .values(validatedData)
      .returning();

    res.status(201).json(newOilType[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating oil type:', error);
    res.status(500).json({ error: 'Failed to create oil type' });
  }
});

// Update oil type
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertOilTypeSchema.partial().parse(req.body);
    
    const updatedOilType = await db
      .update(oilTypes)
      .set({ ...validatedData, lastUpdated: new Date() })
      .where(eq(oilTypes.id, parseInt(id)))
      .returning();

    if (updatedOilType.length === 0) {
      return res.status(404).json({ error: 'Oil type not found' });
    }

    res.json(updatedOilType[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating oil type:', error);
    res.status(500).json({ error: 'Failed to update oil type' });
  }
});

// Delete oil type
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedOilType = await db
      .delete(oilTypes)
      .where(eq(oilTypes.id, parseInt(id)))
      .returning();

    if (deletedOilType.length === 0) {
      return res.status(404).json({ error: 'Oil type not found' });
    }

    res.json({ message: 'Oil type deleted successfully' });
  } catch (error) {
    console.error('Error deleting oil type:', error);
    res.status(500).json({ error: 'Failed to delete oil type' });
  }
});

// Get oil type categories
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db
      .selectDistinct({ category: oilTypes.category })
      .from(oilTypes)
      .where(eq(oilTypes.isActive, true));

    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching oil type categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Bulk update oil types
router.patch('/bulk/update', async (req: Request, res: Response) => {
  try {
    const { ids, updates } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing ids array' });
    }

    const validatedUpdates = insertOilTypeSchema.partial().parse(updates);
    
    const updatedOilTypes = await db
      .update(oilTypes)
      .set({ ...validatedUpdates, lastUpdated: new Date() })
      .where(eq(oilTypes.id, ids[0])) // Simplified for now
      .returning();

    res.json({
      message: `${updatedOilTypes.length} oil types updated successfully`,
      data: updatedOilTypes
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error bulk updating oil types:', error);
    res.status(500).json({ error: 'Failed to bulk update oil types' });
  }
});

// Schema fix endpoint - adds missing display_name column
router.post('/fix-schema', async (req: Request, res: Response) => {
  try {
    console.log('Attempting to fix oil_types schema...');
    
    // Add the missing display_name column
    const addColumnQuery = `
      ALTER TABLE oil_types 
      ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '';
    `;
    
    await db.execute(sql.raw(addColumnQuery));
    console.log('Successfully added display_name column');
    
    res.json({ 
      success: true, 
      message: 'Schema fix applied successfully - display_name column added' 
    });
  } catch (error) {
    console.error('Error fixing oil types schema:', error);
    res.status(500).json({ 
      error: 'Failed to fix schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;