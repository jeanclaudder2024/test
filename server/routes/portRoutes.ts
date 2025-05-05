import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { vesselDataService } from '../services/vesselDataService';
import { portService } from '../services/portService';

export function registerPortRoutes(app: Express) {
  // Get nearby vessels for a specific port
  app.get('/api/ports/:id/nearby-vessels', async (req: Request, res: Response) => {
    try {
      const portId = parseInt(req.params.id);
      if (isNaN(portId)) {
        return res.status(400).json({ message: 'Invalid port ID' });
      }
      
      // Get the port
      const port = await storage.getPortById(portId);
      
      if (!port) {
        return res.status(404).json({ message: 'Port not found' });
      }
      
      // Port needs to have coordinates
      if (!port.lat || !port.lng) {
        return res.status(400).json({ message: 'Port coordinates are missing' });
      }
      
      // Parse port coordinates
      const portLat = typeof port.lat === 'number' ? port.lat : parseFloat(String(port.lat));
      const portLng = typeof port.lng === 'number' ? port.lng : parseFloat(String(port.lng));
      
      // Check if coordinates are valid
      if (isNaN(portLat) || isNaN(portLng)) {
        return res.status(400).json({ message: 'Invalid port coordinates' });
      }
      
      // Get radius from query params or use default
      const radius = req.query.radius ? parseInt(String(req.query.radius)) : 150;
      
      // Get nearby vessels using our service
      const nearbyVessels = await vesselDataService.getVesselsNearLocation(portLat, portLng, radius);
      
      // Limit to max 10 vessels by default or as specified in query
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const limitedVessels = nearbyVessels.slice(0, limit);
      
      return res.json(limitedVessels);
    } catch (error) {
      console.error('Error fetching vessels near port:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
}