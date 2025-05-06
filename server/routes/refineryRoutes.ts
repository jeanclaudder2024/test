import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  refineries, 
  refineryPortConnections, 
  ports, 
  vessels 
} from '@shared/schema';
import { eq, and, like, sql, or, desc, asc } from 'drizzle-orm';
import { refineryAIEnhancer } from '../services/refineryAIEnhancer';

export const refineryRouter = Router();

// Get all refineries with optional filtering
refineryRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { 
      region, 
      country, 
      status, 
      search, 
      sort = 'name',
      order = 'asc',
      limit = 100, 
      offset = 0 
    } = req.query as {
      region?: string;
      country?: string;
      status?: string;
      search?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    };

    // Build query
    let query = db.select().from(refineries);
    
    if (region) {
      query = query.where(eq(refineries.region, region));
    }
    
    if (country) {
      query = query.where(eq(refineries.country, country));
    }
    
    if (status) {
      query = query.where(eq(refineries.status, status));
    }
    
    if (search) {
      query = query.where(
        or(
          like(refineries.name, `%${search}%`),
          like(refineries.operator, `%${search}%`),
          like(refineries.owner, `%${search}%`),
          like(refineries.country, `%${search}%`),
          like(refineries.region, `%${search}%`)
        )
      );
    }
    
    // Add sorting
    if (sort && order) {
      const sortColumn = refineries[sort as keyof typeof refineries] || refineries.name;
      if (order === 'desc') {
        query = query.orderBy(desc(sortColumn));
      } else {
        query = query.orderBy(asc(sortColumn));
      }
    }
    
    // Add pagination
    if (limit) {
      query = query.limit(Number(limit));
    }
    
    if (offset) {
      query = query.offset(Number(offset));
    }
    
    const results = await query;
    
    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(refineries);
    
    res.json({
      data: results,
      meta: {
        count: Number(count),
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching refineries:', error);
    res.status(500).json({ 
      error: 'Failed to fetch refineries',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get refinery by ID
refineryRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refineryId = Number(id);
    
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: 'Invalid refinery ID' });
    }
    
    const [refinery] = await db
      .select()
      .from(refineries)
      .where(eq(refineries.id, refineryId));
    
    if (!refinery) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    
    res.json(refinery);
  } catch (error) {
    console.error('Error fetching refinery details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch refinery details',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Enhance refinery with AI-generated data
refineryRouter.post("/:id/enhance", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refineryId = Number(id);
    
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: 'Invalid refinery ID' });
    }
    
    // Check if OpenAI API key is present
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required for this operation',
        missingKey: true
      });
    }
    
    const enhancedRefineries = await refineryAIEnhancer.enhanceAndUpdateRefineries([refineryId]);
    
    if (enhancedRefineries.length === 0) {
      return res.status(404).json({ error: 'Refinery not found or enhancement failed' });
    }
    
    res.json(enhancedRefineries[0]);
  } catch (error) {
    console.error('Error enhancing refinery:', error);
    res.status(500).json({ 
      error: 'Failed to enhance refinery',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get vessels associated with a refinery
refineryRouter.get("/:id/vessels", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refineryId = Number(id);
    
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: 'Invalid refinery ID' });
    }
    
    // Get vessels where either departure or destination port contains the refinery ID
    // Format is usually "REF:{refineryId}:{refineryName}"
    const refPattern = `REF:${refineryId}:%`;
    
    const associatedVessels = await db
      .select()
      .from(vessels)
      .where(
        or(
          like(vessels.departurePort, refPattern),
          like(vessels.destinationPort, refPattern)
        )
      )
      .limit(20); // Limit results for performance
    
    res.json(associatedVessels);
  } catch (error) {
    console.error('Error fetching associated vessels:', error);
    res.status(500).json({ 
      error: 'Failed to fetch associated vessels',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update refinery information
refineryRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refineryId = Number(id);
    const updates = req.body;
    
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: 'Invalid refinery ID' });
    }
    
    // Remove id from updates to prevent changing primary key
    delete updates.id;
    
    // Update lastUpdated field
    updates.lastUpdated = new Date();
    
    // Handle products and technicalSpecs JSON fields
    if (updates.products && typeof updates.products !== 'string') {
      updates.products = JSON.stringify(updates.products);
    }
    
    if (updates.technicalSpecs && typeof updates.technicalSpecs !== 'string') {
      updates.technicalSpecs = JSON.stringify(updates.technicalSpecs);
    }
    
    // Update refinery in database
    const [updatedRefinery] = await db
      .update(refineries)
      .set(updates)
      .where(eq(refineries.id, refineryId))
      .returning();
    
    if (!updatedRefinery) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    
    res.json(updatedRefinery);
  } catch (error) {
    console.error('Error updating refinery:', error);
    res.status(500).json({ 
      error: 'Failed to update refinery',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get connected ports for a refinery
refineryRouter.get("/:id/connected-ports", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refineryId = Number(id);
    
    if (isNaN(refineryId)) {
      return res.status(400).json({ error: 'Invalid refinery ID' });
    }
    
    // Get refinery to check if it exists
    const [refinery] = await db
      .select()
      .from(refineries)
      .where(eq(refineries.id, refineryId));
    
    if (!refinery) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    
    // Get connected ports with connection details
    const connectedPorts = await db
      .select({
        ...ports,
        connection: {
          id: refineryPortConnections.id,
          refineryId: refineryPortConnections.refineryId,
          portId: refineryPortConnections.portId,
          distance: refineryPortConnections.distance,
          transitTimeHours: refineryPortConnections.transitTimeHours,
          transitTimeDays: refineryPortConnections.transitTimeDays,
          connectionType: refineryPortConnections.connectionType,
          trafficVolume: refineryPortConnections.trafficVolume,
          lastUpdated: refineryPortConnections.lastUpdated
        }
      })
      .from(ports)
      .leftJoin(
        refineryPortConnections,
        and(
          eq(ports.id, refineryPortConnections.portId),
          eq(refineryPortConnections.refineryId, refineryId)
        )
      )
      .where(eq(refineryPortConnections.refineryId, refineryId));
    
    // If no connected ports found, return an empty array
    if (connectedPorts.length === 0) {
      // Calculate nearby ports based on coordinates
      // This could be enhanced with a spatial query, but for simplicity we'll use a basic approach
      if (refinery.lat && refinery.lng) {
        const nearbyPorts = await db
          .select()
          .from(ports)
          .limit(5);
        
        // Calculate distance and add connection info
        const portsWithDistance = nearbyPorts.map(port => {
          // Simple distance calculation
          const distance = calculateDistance(
            parseFloat(refinery.lat), 
            parseFloat(refinery.lng),
            parseFloat(port.lat),
            parseFloat(port.lng)
          );
          
          return {
            ...port,
            connection: {
              distance: distance.toFixed(1),
              transitTimeHours: Math.round(distance / 30), // Simple estimate
              connectionType: 'Potential'
            }
          };
        });
        
        return res.json(portsWithDistance);
      }
      
      return res.json([]);
    }
    
    res.json(connectedPorts);
  } catch (error) {
    console.error('Error fetching connected ports:', error);
    res.status(500).json({ 
      error: 'Failed to fetch connected ports',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get regional statistics for refineries
refineryRouter.get("/stats/regional", async (req: Request, res: Response) => {
  try {
    // Get refinery counts by region
    const regionStats = await db
      .select({
        region: refineries.region,
        count: sql`count(*)`,
        avgCapacity: sql`avg(capacity)`,
        totalCapacity: sql`sum(capacity)`
      })
      .from(refineries)
      .groupBy(refineries.region);
    
    res.json(regionStats);
  } catch (error) {
    console.error('Error fetching refinery statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch refinery statistics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Helper function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}