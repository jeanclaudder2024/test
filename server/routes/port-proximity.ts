import { Router, Request, Response } from 'express';
import { db } from '../db';
import { vessels, ports, refineries } from '../../shared/schema';
import { and, or, sql } from 'drizzle-orm';

const router = Router();

/**
 * Port Proximity Routes
 * API routes to manage vessel positions near ports and refineries
 */

/**
 * Redistribute vessels near important maritime facilities
 * This helps create a more realistic map by placing vessels near ports and refineries
 */
router.post('/enhance-vessel-distribution', async (req: Request, res: Response) => {
  try {
    // Get all active ports (with null check to avoid errors)
    const allPorts = await db.query.ports.findMany({
      where: and(
        sql`${ports.lat} IS NOT NULL`,
        sql`${ports.lng} IS NOT NULL`
      ),
      limit: 20,
      orderBy: (ports, { desc }) => [desc(ports.region)]
    });
    
    // Get all refineries
    const allRefineries = await db.query.refineries.findMany({
      where: and(
        sql`${refineries.lat} IS NOT NULL`,
        sql`${refineries.lng} IS NOT NULL`
      ),
      limit: 15
    });
    
    // Get vessels that can be repositioned (only idle or randomly moving vessels)
    const repositionableVessels = await db.query.vessels.findMany({
      where: and(
        sql`${vessels.currentLat} IS NOT NULL`,
        sql`${vessels.currentLng} IS NOT NULL`,
        or(
          sql`${vessels.status} = 'idle'`,
          sql`${vessels.status} IS NULL`,
          sql`${vessels.status} = 'underway'`
        )
      ),
      limit: 500
    });
    
    // Number of vessels to position near each facility
    const vesselDensity = req.body.vesselDensity || 10;
    
    // Updated vessel count and facility count
    let updatedVesselCount = 0;
    
    // For each port, position some vessels nearby
    for (const port of allPorts) {
      // Skip ports with invalid coordinates
      if (!port.lat || !port.lng) continue;
      
      const portLat = parseFloat(port.lat);
      const portLng = parseFloat(port.lng);
      
      // Position up to vesselDensity vessels near this port
      for (let i = 0; i < Math.min(vesselDensity, Math.floor(repositionableVessels.length / (allPorts.length + allRefineries.length))); i++) {
        const vesselIndex = Math.floor(Math.random() * repositionableVessels.length);
        const vessel = repositionableVessels[vesselIndex];
        
        if (!vessel) continue;
        
        // Remove the vessel from available pool
        repositionableVessels.splice(vesselIndex, 1);
        
        // Generate a random position within 0.05-0.3 degrees of the port
        // This creates a more natural distribution of vessels
        const distanceFactor = 0.05 + Math.random() * 0.25;
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        
        const newLat = portLat + distanceFactor * Math.sin(angle);
        const newLng = portLng + distanceFactor * Math.cos(angle);
        
        // Generate a random speed between 0 and 5 knots (slow speeds near ports)
        const newSpeed = Math.floor(Math.random() * 5);
        
        // Update vessel position
        await db.update(vessels)
          .set({
            currentLat: newLat.toString(),
            currentLng: newLng.toString(),
            speed: newSpeed.toString(),
            status: 'at port',
            destination: port.name
          })
          .where(sql`${vessels.id} = ${vessel.id}`);
          
        updatedVesselCount++;
      }
    }
    
    // For each refinery, position some vessels nearby
    for (const refinery of allRefineries) {
      // Skip refineries with invalid coordinates
      if (!refinery.lat || !refinery.lng) continue;
      
      const refineryLat = parseFloat(refinery.lat);
      const refineryLng = parseFloat(refinery.lng);
      
      // Position up to vesselDensity vessels near this refinery
      for (let i = 0; i < Math.min(vesselDensity, Math.floor(repositionableVessels.length / (allRefineries.length + 1))); i++) {
        const vesselIndex = Math.floor(Math.random() * repositionableVessels.length);
        const vessel = repositionableVessels[vesselIndex];
        
        if (!vessel) continue;
        
        // Remove the vessel from available pool
        repositionableVessels.splice(vesselIndex, 1);
        
        // Generate a random position within 0.05-0.3 degrees of the refinery
        const distanceFactor = 0.05 + Math.random() * 0.25;
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        
        const newLat = refineryLat + distanceFactor * Math.sin(angle);
        const newLng = refineryLng + distanceFactor * Math.cos(angle);
        
        // Generate a random speed between 0 and 7 knots (slightly faster than near ports)
        const newSpeed = Math.floor(Math.random() * 7);
        
        // Update vessel position
        await db.update(vessels)
          .set({
            currentLat: newLat.toString(),
            currentLng: newLng.toString(),
            speed: newSpeed.toString(),
            status: 'near refinery',
            destination: refinery.name
          })
          .where(sql`${vessels.id} = ${vessel.id}`);
          
        updatedVesselCount++;
      }
    }
    
    return res.json({
      success: true,
      message: 'Vessel distribution enhanced',
      updatedVessels: updatedVesselCount,
      facilitiesWithVessels: allPorts.length + allRefineries.length
    });
  } catch (error) {
    console.error('Error enhancing vessel distribution:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to enhance vessel distribution',
      error: String(error)
    });
  }
});

export const portProximityRouter = router;