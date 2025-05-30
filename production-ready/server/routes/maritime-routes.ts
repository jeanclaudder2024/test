import { Router, Request, Response } from "express";
import { maritimeRouteService } from "../services/maritimeRouteService";
import { db } from "../db";
import { vessels } from "@shared/schema";
import { eq } from "drizzle-orm";

// Create router
export const maritimeRoutesRouter = Router();

// Get route for a vessel
maritimeRoutesRouter.get('/api/vessels/:id/route', async (req: Request, res: Response) => {
  try {
    const vesselId = parseInt(req.params.id);
    
    if (isNaN(vesselId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vessel ID'
      });
    }
    
    // Get vessel details
    const vessel = await db.query.vessels.findFirst({
      where: eq(vessels.id, vesselId)
    });
    
    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found'
      });
    }
    
    // Check if vessel already has a route in metadata
    if (vessel.metadata) {
      try {
        const metadata = JSON.parse(vessel.metadata);
        if (metadata.route && metadata.route.waypoints && metadata.route.waypoints.length > 1) {
          return res.status(200).json({
            success: true,
            route: metadata.route,
            source: 'cached'
          });
        }
      } catch (error) {
        console.error("Error parsing vessel metadata:", error);
      }
    }
    
    try {
      // Generate a new route
      const route = await maritimeRouteService.generateAndSaveVesselRoute(vesselId);
      
      return res.status(200).json({
        success: true,
        route,
        vessel: {
          id: vessel.id,
          name: vessel.name,
          currentPosition: {
            lat: vessel.currentLat,
            lng: vessel.currentLng
          },
          destination: vessel.destinationPort
        }
      });
    } catch (routeError) {
      console.error("Could not generate proper route - using fallback:", routeError);
      
      // If route generation fails, create a simple fallback route
      const currentLat = parseFloat(vessel.currentLat || "0");
      const currentLng = parseFloat(vessel.currentLng || "0");
      
      // Simple route with a few points in the vessel's heading direction
      const heading = vessel.heading ? parseFloat(vessel.heading) : 0;
      const headingRad = heading * Math.PI / 180;
      
      // Create a path that extends in the vessel's direction
      const fallbackRoute = {
        waypoints: [
          { lat: currentLat, lng: currentLng },
          { 
            lat: currentLat + (Math.cos(headingRad) * 0.1), 
            lng: currentLng + (Math.sin(headingRad) * 0.1) 
          },
          { 
            lat: currentLat + (Math.cos(headingRad) * 0.2), 
            lng: currentLng + (Math.sin(headingRad) * 0.2) 
          }
        ]
      };
      
      return res.status(200).json({
        success: true,
        route: fallbackRoute,
        fallback: true,
        vessel: {
          id: vessel.id,
          name: vessel.name,
          currentPosition: {
            lat: vessel.currentLat,
            lng: vessel.currentLng
          },
          destination: vessel.destinationPort || 'Unknown'
        }
      });
    }
    
  } catch (error) {
    console.error("Error generating maritime route:", error);
    return res.status(500).json({
      success: false,
      message: 'Error generating maritime route',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check if a point is in water (for pathfinding)
maritimeRoutesRouter.post('/api/maritime/check-point', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.body;
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }
    
    const isInWater = await maritimeRouteService.isPointInWater(lat, lng);
    
    return res.status(200).json({
      success: true,
      isInWater,
      coordinates: { lat, lng }
    });
    
  } catch (error) {
    console.error("Error checking if point is in water:", error);
    return res.status(500).json({
      success: false,
      message: 'Error checking coordinates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});