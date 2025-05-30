import { Router } from 'express';
import { vesselService } from '../services/vesselService';

export const vesselDistributionRouter = Router();

// API endpoint to get vessel region distribution statistics
vesselDistributionRouter.get("/distribution", async (req, res) => {
  try {
    // Get all vessels
    const vessels = await vesselService.getAllVessels();
    
    // Count vessels by region
    const regionCounts: Record<string, number> = {};
    vessels.forEach(vessel => {
      const region = vessel.currentRegion || 'unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    
    // Count oil vessels
    const oilVessels = vessels.filter(vessel => {
      const cargoType = vessel.cargoType || '';
      return cargoType.includes('OIL') || 
             cargoType.includes('CRUDE') || 
             cargoType.includes('PETROL') || 
             cargoType.includes('DIESEL') || 
             cargoType.includes('FUEL') || 
             cargoType.includes('GAS');
    });
    
    // Calculate total cargo
    const totalCargo = vessels.reduce((sum, vessel) => {
      return sum + (vessel.cargoCapacity || 0);
    }, 0);
    
    // Count vessel types
    const vesselTypeCounts: Record<string, number> = {};
    vessels.forEach(vessel => {
      const type = vessel.vesselType || 'unknown';
      vesselTypeCounts[type] = (vesselTypeCounts[type] || 0) + 1;
    });
    
    // Return statistics
    res.json({
      success: true,
      message: "Vessel distribution statistics",
      data: {
        totalVessels: vessels.length,
        regionCounts,
        oilVessels: oilVessels.length,
        totalCargo,
        vesselTypeCounts
      }
    });
  } catch (error: any) {
    console.error("Error getting vessel distribution statistics:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch vessel distribution statistics",
      error: error.message || "Unknown error" 
    });
  }
});