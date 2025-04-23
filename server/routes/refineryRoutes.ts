import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertRefinerySchema } from '@shared/schema';
import { broadcastRefineryUpdate } from '../events';

export const refineryRouter = Router();

/**
 * @route GET /api/refineries
 * @description Get all refineries
 * @access Public
 */
refineryRouter.get('/', async (req, res) => {
  try {
    const refineries = await storage.getRefineries();
    res.json(refineries);
  } catch (error) {
    console.error('Error fetching refineries:', error);
    res.status(500).json({ error: 'Failed to fetch refineries' });
  }
});

/**
 * @route GET /api/refineries/:id
 * @description Get a refinery by ID
 * @access Public
 */
refineryRouter.get('/:id', async (req, res) => {
  try {
    const refinery = await storage.getRefineryById(Number(req.params.id));
    if (!refinery) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    res.json(refinery);
  } catch (error) {
    console.error('Error fetching refinery:', error);
    res.status(500).json({ error: 'Failed to fetch refinery' });
  }
});

/**
 * @route GET /api/refineries/region/:region
 * @description Get refineries by region
 * @access Public
 */
refineryRouter.get('/region/:region', async (req, res) => {
  try {
    const refineries = await storage.getRefineryByRegion(req.params.region);
    res.json(refineries);
  } catch (error) {
    console.error('Error fetching refineries by region:', error);
    res.status(500).json({ error: 'Failed to fetch refineries by region' });
  }
});

/**
 * @route POST /api/refineries
 * @description Create a new refinery
 * @access Public
 */
refineryRouter.post('/', async (req, res) => {
  try {
    const validatedData = insertRefinerySchema.parse(req.body);
    const refinery = await storage.createRefinery(validatedData);
    
    // Broadcast refinery update to connected clients
    broadcastRefineryUpdate(refinery);
    
    res.status(201).json(refinery);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating refinery:', error);
    res.status(500).json({ error: 'Failed to create refinery' });
  }
});

/**
 * @route PUT /api/refineries/:id
 * @description Update a refinery
 * @access Public
 */
refineryRouter.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const refinery = await storage.getRefineryById(id);
    
    if (!refinery) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    
    const validatedData = z.object({
      name: z.string().optional(),
      country: z.string().optional(),
      region: z.string().optional(),
      lat: z.string().optional(),
      lng: z.string().optional(),
      capacity: z.number().optional(),
      status: z.string().optional(),
      description: z.string().optional(),
    }).parse(req.body);
    
    const updatedRefinery = await storage.updateRefinery(id, validatedData);
    
    // Broadcast refinery update to connected clients
    if (updatedRefinery) {
      broadcastRefineryUpdate(updatedRefinery);
    }
    
    res.json(updatedRefinery);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating refinery:', error);
    res.status(500).json({ error: 'Failed to update refinery' });
  }
});

/**
 * @route DELETE /api/refineries/:id
 * @description Delete a refinery
 * @access Public
 */
refineryRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await storage.deleteRefinery(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting refinery:', error);
    res.status(500).json({ error: 'Failed to delete refinery' });
  }
});