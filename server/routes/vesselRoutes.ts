import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertVesselSchema } from '@shared/schema';
import { broadcastVesselUpdate } from '../events';

export const vesselRouter = Router();

/**
 * @route GET /api/vessels
 * @description Get all vessels
 * @access Public
 */
vesselRouter.get('/', async (req, res) => {
  try {
    const vessels = await storage.getVessels();
    res.json(vessels);
  } catch (error) {
    console.error('Error fetching vessels:', error);
    res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

/**
 * @route GET /api/vessels/:id
 * @description Get a vessel by ID
 * @access Public
 */
vesselRouter.get('/:id', async (req, res) => {
  try {
    const vessel = await storage.getVesselById(Number(req.params.id));
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(vessel);
  } catch (error) {
    console.error('Error fetching vessel:', error);
    res.status(500).json({ error: 'Failed to fetch vessel' });
  }
});

/**
 * @route GET /api/vessels/region/:region
 * @description Get vessels by region
 * @access Public
 */
vesselRouter.get('/region/:region', async (req, res) => {
  try {
    const vessels = await storage.getVesselsByRegion(req.params.region);
    res.json(vessels);
  } catch (error) {
    console.error('Error fetching vessels by region:', error);
    res.status(500).json({ error: 'Failed to fetch vessels by region' });
  }
});

/**
 * @route POST /api/vessels
 * @description Create a new vessel
 * @access Public
 */
vesselRouter.post('/', async (req, res) => {
  try {
    const validatedData = insertVesselSchema.parse(req.body);
    const vessel = await storage.createVessel(validatedData);
    
    // Broadcast vessel update to connected clients
    broadcastVesselUpdate(vessel);
    
    res.status(201).json(vessel);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating vessel:', error);
    res.status(500).json({ error: 'Failed to create vessel' });
  }
});

/**
 * @route PUT /api/vessels/:id
 * @description Update a vessel
 * @access Public
 */
vesselRouter.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const vessel = await storage.getVesselById(id);
    
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    const validatedData = z.object({
      name: z.string().optional(),
      imo: z.string().optional(),
      mmsi: z.string().optional(),
      vesselType: z.string().optional(),
      flag: z.string().optional(),
      built: z.number().optional(),
      deadweight: z.number().optional(),
      currentLat: z.string().optional(),
      currentLng: z.string().optional(),
      departurePort: z.string().optional(),
      destinationPort: z.string().optional(),
      cargoType: z.string().optional(),
      cargoCapacity: z.number().optional(),
      eta: z.string().optional(),
      departureDate: z.string().optional(),
    }).parse(req.body);
    
    const updatedVessel = await storage.updateVessel(id, validatedData);
    
    // Broadcast vessel update to connected clients
    if (updatedVessel) {
      broadcastVesselUpdate(updatedVessel);
    }
    
    res.json(updatedVessel);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating vessel:', error);
    res.status(500).json({ error: 'Failed to update vessel' });
  }
});

/**
 * @route DELETE /api/vessels/:id
 * @description Delete a vessel
 * @access Public
 */
vesselRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await storage.deleteVessel(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting vessel:', error);
    res.status(500).json({ error: 'Failed to delete vessel' });
  }
});

/**
 * @route GET /api/vessels/:id/progress
 * @description Get progress events for a vessel
 * @access Public
 */
vesselRouter.get('/:id/progress', async (req, res) => {
  try {
    const vesselId = Number(req.params.id);
    const vessel = await storage.getVesselById(vesselId);
    
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    const progressEvents = await storage.getProgressEventsByVesselId(vesselId);
    res.json(progressEvents);
  } catch (error) {
    console.error('Error fetching vessel progress events:', error);
    res.status(500).json({ error: 'Failed to fetch vessel progress events' });
  }
});

/**
 * @route POST /api/vessels/:id/progress
 * @description Add a progress event to a vessel
 * @access Public
 */
vesselRouter.post('/:id/progress', async (req, res) => {
  try {
    const vesselId = Number(req.params.id);
    const vessel = await storage.getVesselById(vesselId);
    
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    const eventData = {
      vesselId,
      event: req.body.event,
      date: new Date(),
      location: req.body.location,
      lat: req.body.lat,
      lng: req.body.lng
    };
    
    const progressEvent = await storage.createProgressEvent(eventData);
    res.status(201).json(progressEvent);
  } catch (error) {
    console.error('Error creating vessel progress event:', error);
    res.status(500).json({ error: 'Failed to create vessel progress event' });
  }
});