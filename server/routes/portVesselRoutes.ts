import { Router } from 'express';
import { storage } from '../storage';
import { portVesselService } from '../services/portVesselService';

const router = Router();

/**
 * Get all ports with summary of vessel counts
 * Supports pagination, region filtering, and sorting
 */
router.get('/with-vessels/summary', async (req, res) => {
  try {
    const {
      region,
      page: pageStr,
      limit: limitStr,
      sortBy = 'name',
      sortOrder = 'asc',
      portType,
      useAI = 'true'
    } = req.query;

    // Parse pagination parameters
    const page = pageStr ? parseInt(pageStr as string) : 1;
    const limit = limitStr ? parseInt(limitStr as string) : 12;

    // Validate pagination
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid limit parameter (must be between 1 and 100)' });
    }

    // Get ports with vessel counts, with optional AI-powered vessel selection
    const result = await portVesselService.getPortsWithVesselsSummary({
      region: region as string,
      page,
      limit,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string) === 'desc' ? 'desc' : 'asc',
      portType: portType as string,
      useAI: useAI === 'true'
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching ports with vessel summary:', error);
    res.status(500).json({
      error: 'Failed to fetch port data with vessel summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get a single port by ID with vessels in proximity
 */
router.get('/:id', async (req, res) => {
  try {
    const portId = parseInt(req.params.id);
    
    if (isNaN(portId)) {
      return res.status(400).json({ error: 'Invalid port ID' });
    }
    
    const maxDistanceKm = req.query.distance 
      ? parseInt(req.query.distance as string) 
      : 20; // Default to 20km radius
    
    // Get port with nearby vessels
    const portWithVessels = await portVesselService.getPortWithNearbyVessels(
      portId,
      maxDistanceKm
    );
    
    res.json(portWithVessels);
  } catch (error) {
    console.error(`Error fetching port ${req.params.id} with nearby vessels:`, error);
    
    // Handle "not found" errors specifically
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Port not found',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch port data with nearby vessels',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get vessels near a specific port
 */
router.get('/:id/vessels', async (req, res) => {
  try {
    const portId = parseInt(req.params.id);
    
    if (isNaN(portId)) {
      return res.status(400).json({ error: 'Invalid port ID' });
    }
    
    const maxDistanceKm = req.query.distance 
      ? parseInt(req.query.distance as string) 
      : 20; // Default to 20km radius
    
    // Get port with nearby vessels
    const { vessels } = await portVesselService.getPortWithNearbyVessels(
      portId,
      maxDistanceKm
    );
    
    res.json({
      portId,
      vessels,
      count: vessels.length,
      maxDistanceKm
    });
  } catch (error) {
    console.error(`Error fetching vessels near port ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to fetch vessels near port',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;