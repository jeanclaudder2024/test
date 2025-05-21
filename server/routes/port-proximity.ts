/**
 * Port Proximity Routes
 * API routes to manage vessel positions near ports and refineries
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { vessels, ports, refineries } from '../../shared/schema';
import { eq, and, or, like, sql } from 'drizzle-orm';

const router = Router();

/**
 * Redistribute vessels near important maritime facilities
 * This helps create a more realistic map by placing vessels near ports and refineries
 */
router.post('/enhance-vessel-distribution', async (req: Request, res: Response) => {
  try {
    // Get all active ports
    const allPorts = await db.query.ports.findMany({
      limit: 20,
      orderBy: (ports, { desc }) => [desc(ports.region)]
    });
    
    // Get all refineries
    const allRefineries = await db.query.refineries.findMany({
      limit: 15
    });
    
    const updatedVessels = {
      ports: 0,
      refineries: 0,
      totalVessels: 0
    };
    
    // Process ports - add vessels near each port
    for (const port of allPorts) {
      if (!port.lat || !port.lng) continue;
      
      // Determine how many vessels to place near this port (3-8 vessels per port)
      const vesselCount = 3 + Math.floor(Math.random() * 6);
      
      // Find vessels that can be placed near this port
      // Prioritize oil tankers and cargo vessels for realism
      const availableVessels = await db.query.vessels.findMany({
        where: or(
          eq(vessels.vesselType, "Oil Tanker"),
          eq(vessels.vesselType, "Crude Oil Tanker"),
          eq(vessels.vesselType, "Product Tanker"),
          eq(vessels.vesselType, "Cargo Ship")
        ),
        limit: 100
      });
      
      // Shuffle vessels and take the needed number
      const selectedVessels = availableVessels
        .sort(() => 0.5 - Math.random())
        .slice(0, vesselCount);
      
      // Position vessels around the port
      const portLat = parseFloat(port.lat);
      const portLng = parseFloat(port.lng);
      
      for (const vessel of selectedVessels) {
        // Generate a random position within ~20-50km of the port
        // Using a circular distribution for realism
        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = 0.1 + Math.random() * 0.3; // ~10-40km
        
        const newLat = portLat + Math.sin(angle) * distance;
        const newLng = portLng + Math.cos(angle) * distance;
        
        // Skip obviously invalid positions (e.g., on land)
        // This is a simplified check - a real system would use more sophisticated
        // checks, like coastline data
        if (newLat < -85 || newLat > 85 || newLng < -180 || newLng > 180) {
          continue;
        }
        
        // Update vessel position
        await db.update(vessels)
          .set({
            currentLat: String(newLat.toFixed(6)),
            currentLng: String(newLng.toFixed(6)),
            // Set a reasonable speed for vessels near ports (slower)
            currentSpeed: 2 + Math.random() * 6,
            // Link to port for navigation data
            departurePort: Math.random() > 0.5 ? port.name : vessel.departurePort,
            destinationPort: Math.random() > 0.5 ? port.name : vessel.destinationPort,
          })
          .where(eq(vessels.id, vessel.id));
        
        updatedVessels.totalVessels++;
      }
      
      updatedVessels.ports++;
    }
    
    // Process refineries - add vessels near each refinery
    for (const refinery of allRefineries) {
      if (!refinery.lat || !refinery.lng) continue;
      
      // Determine how many vessels to place near this refinery (2-5 vessels per refinery)
      const vesselCount = 2 + Math.floor(Math.random() * 4);
      
      // Find vessels that can be placed near this refinery
      // For refineries, prioritize oil tankers for realism
      const availableVessels = await db.query.vessels.findMany({
        where: or(
          eq(vessels.vesselType, "Oil Tanker"),
          eq(vessels.vesselType, "Crude Oil Tanker"),
          eq(vessels.vesselType, "Product Tanker")
        ),
        limit: 50
      });
      
      // Shuffle vessels and take the needed number
      const selectedVessels = availableVessels
        .sort(() => 0.5 - Math.random())
        .slice(0, vesselCount);
      
      // Position vessels around the refinery
      const refineryLat = parseFloat(refinery.lat);
      const refineryLng = parseFloat(refinery.lng);
      
      for (const vessel of selectedVessels) {
        // Generate a random position within ~10-30km of the refinery
        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = 0.1 + Math.random() * 0.2; // ~10-30km
        
        const newLat = refineryLat + Math.sin(angle) * distance;
        const newLng = refineryLng + Math.cos(angle) * distance;
        
        // Skip obviously invalid positions
        if (newLat < -85 || newLat > 85 || newLng < -180 || newLng > 180) {
          continue;
        }
        
        // Update vessel position
        await db.update(vessels)
          .set({
            currentLat: String(newLat.toFixed(6)),
            currentLng: String(newLng.toFixed(6)),
            // Set a reasonable speed for vessels near refineries
            currentSpeed: 1 + Math.random() * 5,
          })
          .where(eq(vessels.id, vessel.id));
        
        updatedVessels.totalVessels++;
      }
      
      updatedVessels.refineries++;
    }
    
    res.json({
      success: true,
      message: "Vessel distribution enhanced",
      stats: updatedVessels
    });
    
  } catch (error) {
    console.error("Error enhancing vessel distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enhance vessel distribution",
      error: String(error)
    });
  }
});

export const portProximityRouter = router;