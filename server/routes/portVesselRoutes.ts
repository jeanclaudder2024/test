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

/**
 * Connect a vessel to a port manually
 */
router.post('/connect', async (req, res) => {
  try {
    const { vesselId, portId, moveToPort = false } = req.body;
    
    if (!vesselId || !portId) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'Both vesselId and portId are required'
      });
    }
    
    // Convert to numbers if they are strings
    const vesselIdNum = typeof vesselId === 'string' ? parseInt(vesselId) : vesselId;
    const portIdNum = typeof portId === 'string' ? parseInt(portId) : portId;
    
    if (isNaN(vesselIdNum) || isNaN(portIdNum)) {
      return res.status(400).json({ error: 'Invalid vessel ID or port ID' });
    }
    
    // Get vessel and port
    const vessel = await storage.getVesselById(vesselIdNum);
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    
    const port = await storage.getPortById(portIdNum);
    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }
    
    // Update object to store changes
    const vesselUpdates: any = {
      destinationPort: port.name,
      destinationLat: port.lat,
      destinationLng: port.lng
    };
    
    // Optionally move the vessel near the port
    if (moveToPort) {
      const portLat = typeof port.lat === 'string' ? parseFloat(port.lat) : port.lat;
      const portLng = typeof port.lng === 'string' ? parseFloat(port.lng) : port.lng;
      
      if (!isNaN(portLat) && !isNaN(portLng)) {
        // Add a small random offset to make vessel appear near but not exactly at the port
        // This creates a more realistic position (within about 2km of the port)
        const latOffset = (Math.random() * 0.03 - 0.015) / 111; // +/- ~1.5km in latitude
        const lngFactor = Math.cos(portLat * Math.PI / 180);
        const lngOffset = (Math.random() * 0.03 - 0.015) / (111 * lngFactor); // +/- ~1.5km in longitude
        
        vesselUpdates.currentLat = (portLat + latOffset).toString();
        vesselUpdates.currentLng = (portLng + lngOffset).toString();
      }
    }
    
    // Update vessel with all changes
    const updatedVessel = await storage.updateVessel(vesselIdNum, vesselUpdates);
    
    res.json({
      success: true,
      message: `Vessel ${vessel.name} successfully connected to port ${port.name}${moveToPort ? ' and moved near port' : ''}`,
      data: {
        vessel: updatedVessel,
        port
      }
    });
  } catch (error) {
    console.error('Error connecting vessel to port:', error);
    res.status(500).json({
      error: 'Failed to connect vessel to port',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;