import { Router } from 'express';
import { storage } from '../storage';
import { vesselService } from '../services/vesselService';
import { refineryService } from '../services/refineryService';

/**
 * API routes for testing large dataset performance
 */
export const apiTesterRouter = Router();

// Test database performance with large datasets
apiTesterRouter.get('/performance', async (req, res) => {
  try {
    console.time('performance-test-all-vessels');
    const vessels = await storage.getVessels();
    console.timeEnd('performance-test-all-vessels');
    
    console.time('performance-test-all-refineries');
    const refineries = await storage.getRefineries();
    console.timeEnd('performance-test-all-refineries');
    
    console.time('performance-test-vessel-by-id');
    if (vessels.length > 0) {
      const randomId = Math.floor(Math.random() * vessels.length) + 1;
      await storage.getVesselById(randomId);
    }
    console.timeEnd('performance-test-vessel-by-id');
    
    console.time('performance-test-vessel-by-region');
    await storage.getVesselsByRegion('Asia');
    console.timeEnd('performance-test-vessel-by-region');
    
    console.time('performance-test-refinery-by-region');
    await storage.getRefineryByRegion('Europe');
    console.timeEnd('performance-test-refinery-by-region');
    
    return res.json({
      success: true,
      message: 'Performance tests completed successfully',
      counts: {
        vessels: vessels.length,
        refineries: refineries.length
      }
    });
  } catch (error) {
    console.error('Error testing API performance:', error);
    return res.status(500).json({
      success: false,
      message: 'Error testing API performance'
    });
  }
});

// Test API with large seed data
apiTesterRouter.post('/seed-large', async (req, res) => {
  try {
    console.time('large-seed-operation');
    
    // Clear existing data first (optional based on user preferences)
    // Would need to implement a method to clear the database first
    
    // Generate new large datasets
    console.log('Starting large dataset seeding operation...');
    const vesselResult = await vesselService.seedVesselData();
    const refineryResult = await refineryService.seedRefineryData();
    
    console.timeEnd('large-seed-operation');
    
    return res.json({
      success: true,
      message: 'Large seed data created successfully',
      vessels: vesselResult.vessels,
      refineries: refineryResult.refineries,
      events: vesselResult.progressEvents
    });
  } catch (error) {
    console.error('Error seeding large data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed large data'
    });
  }
});

// Performance test with filter operations
apiTesterRouter.get('/filter-test', async (req, res) => {
  try {
    // Get query parameters for testing filters
    const { vesselType, region, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 100;
    
    console.time('performance-test-filtered-vessels');
    
    // Get all vessels
    const vessels = await storage.getVessels();
    
    // Apply filters in memory (simulating what would happen in a database query)
    let filteredVessels = [...vessels];
    
    if (vesselType) {
      console.time('filter-by-vessel-type');
      filteredVessels = filteredVessels.filter(v => 
        v.vesselType?.toLowerCase() === (vesselType as string).toLowerCase()
      );
      console.timeEnd('filter-by-vessel-type');
    }
    
    if (region) {
      console.time('filter-by-region');
      filteredVessels = filteredVessels.filter(v => 
        v.currentRegion?.toLowerCase() === (region as string).toLowerCase()
      );
      console.timeEnd('filter-by-region');
    }
    
    // Apply limit
    console.time('apply-limit');
    filteredVessels = filteredVessels.slice(0, limitNum);
    console.timeEnd('apply-limit');
    
    console.timeEnd('performance-test-filtered-vessels');
    
    return res.json({
      success: true,
      count: filteredVessels.length,
      totalCount: vessels.length,
      vessels: filteredVessels
    });
  } catch (error) {
    console.error('Error testing filter performance:', error);
    return res.status(500).json({
      success: false,
      message: 'Error testing filter performance'
    });
  }
});