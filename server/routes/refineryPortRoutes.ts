import { Router, Request, Response } from 'express';
import { db } from '../db';
import { refineryPortConnections, refineries, ports } from '@shared/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export const refineryPortRouter = Router();

// Get all refinery-port connections
refineryPortRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { refineryId, portId, limit = 100, offset = 0 } = req.query as {
      refineryId?: string;
      portId?: string;
      limit?: number;
      offset?: number;
    };
    
    let query = db.select({
      ...refineryPortConnections,
      refinery: {
        id: refineries.id,
        name: refineries.name,
        country: refineries.country,
        region: refineries.region
      },
      port: {
        id: ports.id,
        name: ports.name,
        country: ports.country,
        region: ports.region
      }
    })
    .from(refineryPortConnections)
    .leftJoin(refineries, eq(refineryPortConnections.refineryId, refineries.id))
    .leftJoin(ports, eq(refineryPortConnections.portId, ports.id));
    
    if (refineryId) {
      query = query.where(eq(refineryPortConnections.refineryId, parseInt(refineryId)));
    }
    
    if (portId) {
      query = query.where(eq(refineryPortConnections.portId, parseInt(portId)));
    }
    
    // Add pagination
    const connections = await query.limit(Number(limit)).offset(Number(offset));
    
    res.json(connections);
  } catch (error) {
    console.error('Error fetching refinery-port connections:', error);
    res.status(500).json({
      error: 'Failed to fetch refinery-port connections',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a new refinery-port connection
refineryPortRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { refineryId, portId, distance, transitTimeHours, transitTimeDays, connectionType, trafficVolume } = req.body;
    
    // Check if both refinery and port exist
    const [refinery] = await db
      .select()
      .from(refineries)
      .where(eq(refineries.id, refineryId));
      
    const [port] = await db
      .select()
      .from(ports)
      .where(eq(ports.id, portId));
    
    if (!refinery) {
      return res.status(404).json({ error: 'Refinery not found' });
    }
    
    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }
    
    // Check if connection already exists
    const [existingConnection] = await db
      .select()
      .from(refineryPortConnections)
      .where(
        and(
          eq(refineryPortConnections.refineryId, refineryId),
          eq(refineryPortConnections.portId, portId)
        )
      );
    
    if (existingConnection) {
      return res.status(409).json({ 
        error: 'Connection already exists', 
        connection: existingConnection 
      });
    }
    
    // Create the connection
    const [connection] = await db
      .insert(refineryPortConnections)
      .values({
        refineryId,
        portId,
        distance,
        transitTimeHours,
        transitTimeDays,
        connectionType,
        trafficVolume,
        lastUpdated: new Date()
      })
      .returning();
    
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error creating refinery-port connection:', error);
    res.status(500).json({
      error: 'Failed to create refinery-port connection',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get a specific refinery-port connection
refineryPortRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connectionId = Number(id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }
    
    const [connection] = await db
      .select({
        ...refineryPortConnections,
        refinery: {
          id: refineries.id,
          name: refineries.name,
          country: refineries.country,
          region: refineries.region
        },
        port: {
          id: ports.id,
          name: ports.name,
          country: ports.country,
          region: ports.region
        }
      })
      .from(refineryPortConnections)
      .leftJoin(refineries, eq(refineryPortConnections.refineryId, refineries.id))
      .leftJoin(ports, eq(refineryPortConnections.portId, ports.id))
      .where(eq(refineryPortConnections.id, connectionId));
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json(connection);
  } catch (error) {
    console.error('Error fetching refinery-port connection:', error);
    res.status(500).json({
      error: 'Failed to fetch refinery-port connection',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update a refinery-port connection
refineryPortRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connectionId = Number(id);
    const updates = req.body;
    
    if (isNaN(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }
    
    // Remove id from updates to prevent changing primary key
    delete updates.id;
    
    // Remove refineryId and portId to prevent changing relationship
    delete updates.refineryId;
    delete updates.portId;
    
    // Update lastUpdated field
    updates.lastUpdated = new Date();
    
    // Update connection in database
    const [updatedConnection] = await db
      .update(refineryPortConnections)
      .set(updates)
      .where(eq(refineryPortConnections.id, connectionId))
      .returning();
    
    if (!updatedConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json(updatedConnection);
  } catch (error) {
    console.error('Error updating refinery-port connection:', error);
    res.status(500).json({
      error: 'Failed to update refinery-port connection',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete a refinery-port connection
refineryPortRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connectionId = Number(id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }
    
    // Delete connection
    const [deletedConnection] = await db
      .delete(refineryPortConnections)
      .where(eq(refineryPortConnections.id, connectionId))
      .returning();
    
    if (!deletedConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    res.json({
      message: 'Connection deleted successfully', 
      connection: deletedConnection
    });
  } catch (error) {
    console.error('Error deleting refinery-port connection:', error);
    res.status(500).json({
      error: 'Failed to delete refinery-port connection',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});