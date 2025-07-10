import express from 'express';
import { db } from '../db';
import { vessels, refineries, ports } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export const portProximityRouter = express.Router();

// Get vessels near a specific port (within reasonable distance)
portProximityRouter.get('/vessels/:portId', async (req, res) => {
  try {
    const portId = parseInt(req.params.portId);
    if (isNaN(portId)) {
      return res.status(400).json({ message: "Invalid port ID" });
    }

    // First get the port coordinates
    const [port] = await db.select().from(ports).where(eq(ports.id, portId));
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }

    // Get all vessels and calculate distance (simplified - within same region or nearby coordinates)
    const allVessels = await db.select().from(vessels);
    
    // Filter vessels that are connected to this port or nearby
    const nearbyVessels = allVessels.filter(vessel => {
      // Check if vessel has this port as departure or destination
      if (vessel.departurePort === portId.toString() || vessel.destinationPort === portId.toString()) {
        return true;
      }
      
      // Check if vessel is in the same region/country as the port
      if (vessel.currentLocation?.toLowerCase().includes(port.country.toLowerCase()) ||
          vessel.currentLocation?.toLowerCase().includes(port.region?.toLowerCase() || '')) {
        return true;
      }
      
      // Check by coordinates if available (within ~500km radius)
      if (vessel.currentLat && vessel.currentLng && port.latitude && port.longitude) {
        const distance = calculateDistance(
          vessel.currentLat, 
          vessel.currentLng, 
          port.latitude, 
          port.longitude
        );
        return distance <= 500; // 500km radius
      }
      
      return false;
    });

    res.json(nearbyVessels);
  } catch (error) {
    console.error("Error fetching vessels near port:", error);
    res.status(500).json({ message: "Failed to fetch nearby vessels" });
  }
});

// Get refineries near a specific port
portProximityRouter.get('/refineries/:portId', async (req, res) => {
  try {
    const portId = parseInt(req.params.portId);
    if (isNaN(portId)) {
      return res.status(400).json({ message: "Invalid port ID" });
    }

    // First get the port
    const [port] = await db.select().from(ports).where(eq(ports.id, portId));
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }

    // Get all refineries and filter by proximity
    const allRefineries = await db.select().from(refineries);
    
    // Filter refineries in the same region/country or nearby coordinates
    const nearbyRefineries = allRefineries.filter(refinery => {
      // Check if refinery is in the same country or region
      if (refinery.country?.toLowerCase() === port.country?.toLowerCase()) {
        return true;
      }
      
      if (refinery.region?.toLowerCase() === port.region?.toLowerCase()) {
        return true;
      }
      
      // Check by coordinates if available (within ~1000km radius for refineries)
      if (refinery.latitude && refinery.longitude && port.latitude && port.longitude) {
        const distance = calculateDistance(
          refinery.latitude, 
          refinery.longitude, 
          port.latitude, 
          port.longitude
        );
        return distance <= 1000; // 1000km radius for refineries
      }
      
      return false;
    });

    res.json(nearbyRefineries);
  } catch (error) {
    console.error("Error fetching refineries near port:", error);
    res.status(500).json({ message: "Failed to fetch nearby refineries" });
  }
});

// Get both vessels and refineries near a port
portProximityRouter.get('/all/:portId', async (req, res) => {
  try {
    const portId = parseInt(req.params.portId);
    if (isNaN(portId)) {
      return res.status(400).json({ message: "Invalid port ID" });
    }

    // Get port
    const [port] = await db.select().from(ports).where(eq(ports.id, portId));
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }

    // Get vessels and refineries in parallel
    const allVessels = await db.select().from(vessels);
    const allRefineries = await db.select().from(refineries);
    
    // Filter vessels near port
    const nearbyVessels = allVessels.filter(vessel => {
      if (vessel.departurePort === portId.toString() || vessel.destinationPort === portId.toString()) {
        return true;
      }
      
      if (vessel.currentLocation?.toLowerCase().includes(port.country.toLowerCase()) ||
          vessel.currentLocation?.toLowerCase().includes(port.region?.toLowerCase() || '')) {
        return true;
      }
      
      if (vessel.currentLat && vessel.currentLng && port.latitude && port.longitude) {
        const distance = calculateDistance(
          vessel.currentLat, 
          vessel.currentLng, 
          port.latitude, 
          port.longitude
        );
        return distance <= 500;
      }
      
      return false;
    });

    // Filter refineries near port
    const nearbyRefineries = allRefineries.filter(refinery => {
      if (refinery.country?.toLowerCase() === port.country?.toLowerCase()) {
        return true;
      }
      
      if (refinery.region?.toLowerCase() === port.region?.toLowerCase()) {
        return true;
      }
      
      if (refinery.latitude && refinery.longitude && port.latitude && port.longitude) {
        const distance = calculateDistance(
          refinery.latitude, 
          refinery.longitude, 
          port.latitude, 
          port.longitude
        );
        return distance <= 1000;
      }
      
      return false;
    });

    res.json({
      port,
      vessels: nearbyVessels,
      refineries: nearbyRefineries,
      summary: {
        totalVessels: nearbyVessels.length,
        totalRefineries: nearbyRefineries.length
      }
    });
  } catch (error) {
    console.error("Error fetching data near port:", error);
    res.status(500).json({ message: "Failed to fetch nearby data" });
  }
});

// Helper function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default portProximityRouter;