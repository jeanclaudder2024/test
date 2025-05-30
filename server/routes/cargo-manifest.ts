import { Request, Response } from 'express';
import { storage } from '../storage';

export async function generateCargoManifest(req: Request, res: Response) {
  try {
    const vesselId = parseInt(req.params.id);
    
    if (isNaN(vesselId)) {
      return res.status(400).json({ error: 'Invalid vessel ID' });
    }

    // Get vessel information from database
    const vessel = await storage.getVesselById(vesselId);
    
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    // Generate cargo manifest based on vessel data
    const manifest = {
      vesselInfo: {
        name: vessel.name,
        imo: vessel.imo,
        mmsi: vessel.mmsi,
        flag: vessel.flag,
        vesselType: vessel.vesselType
      },
      cargo: {
        type: vessel.cargoType || 'Crude Oil',
        amount: vessel.cargoAmount || 0,
        description: `Maritime cargo manifest for ${vessel.name}`
      },
      route: {
        departure: vessel.departurePort,
        destination: vessel.destinationPort,
        currentPosition: {
          lat: vessel.currentLat,
          lng: vessel.currentLng
        }
      },
      generatedAt: new Date().toISOString()
    };

    res.json(manifest);
  } catch (error) {
    console.error('Error generating cargo manifest:', error);
    res.status(500).json({ error: 'Failed to generate cargo manifest' });
  }
}