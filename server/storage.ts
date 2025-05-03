import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, vessels, refineries, progressEvents, documents, brokers, stats as statsTable, ports,
  User, InsertUser, 
  Vessel, InsertVessel,
  Refinery, InsertRefinery,
  ProgressEvent, InsertProgressEvent,
  Document, InsertDocument,
  Broker, InsertBroker,
  Stats, InsertStats,
  Port, InsertPort
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Vessel methods
  getVessels(): Promise<Vessel[]>;
  getVesselById(id: number): Promise<Vessel | undefined>;
  getVesselsByRegion(region: string): Promise<Vessel[]>;
  createVessel(vessel: InsertVessel): Promise<Vessel>;
  updateVessel(id: number, vessel: Partial<InsertVessel>): Promise<Vessel | undefined>;
  deleteVessel(id: number): Promise<boolean>;

  // Refinery methods
  getRefineries(): Promise<Refinery[]>;
  getRefineryById(id: number): Promise<Refinery | undefined>;
  getRefineryByRegion(region: string): Promise<Refinery[]>;
  createRefinery(refinery: InsertRefinery): Promise<Refinery>;
  updateRefinery(id: number, refinery: Partial<InsertRefinery>): Promise<Refinery | undefined>;
  deleteRefinery(id: number): Promise<boolean>;

  // Port methods
  getPorts(): Promise<Port[]>;
  getPortById(id: number): Promise<Port | undefined>;
  getPortsByRegion(region: string): Promise<Port[]>;
  createPort(port: InsertPort): Promise<Port>;
  createPortsBulk(ports: InsertPort[]): Promise<Port[]>; // Bulk insert method
  updatePort(id: number, port: Partial<InsertPort>): Promise<Port | undefined>;
  deletePort(id: number): Promise<boolean>;

  // Progress Event methods
  getProgressEventsByVesselId(vesselId: number): Promise<ProgressEvent[]>;
  createProgressEvent(event: InsertProgressEvent): Promise<ProgressEvent>;
  deleteProgressEvent(id: number): Promise<boolean>;

  // Document methods
  getDocuments(): Promise<Document[]>;
  getDocumentsByVesselId(vesselId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Broker methods
  getBrokers(): Promise<Broker[]>;
  getBrokerById(id: number): Promise<Broker | undefined>;
  createBroker(broker: InsertBroker): Promise<Broker>;
  updateBroker(id: number, broker: Partial<InsertBroker>): Promise<Broker | undefined>;
  deleteBroker(id: number): Promise<boolean>;

  // Stats methods
  getStats(): Promise<Stats | undefined>;
  updateStats(stats: Partial<InsertStats>): Promise<Stats | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user || undefined;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getVessels(): Promise<Vessel[]> {
    return await db.select().from(vessels);
  }

  async getVesselById(id: number): Promise<Vessel | undefined> {
    const [vessel] = await db.select().from(vessels).where(eq(vessels.id, id));
    return vessel || undefined;
  }

  async getVesselsByRegion(region: string): Promise<Vessel[]> {
    return await db.select().from(vessels).where(eq(vessels.currentRegion, region));
  }

  async createVessel(insertVessel: InsertVessel): Promise<Vessel> {
    const [vessel] = await db.insert(vessels).values(insertVessel).returning();
    return vessel;
  }

  async updateVessel(id: number, vesselUpdate: Partial<InsertVessel>): Promise<Vessel | undefined> {
    const [updatedVessel] = await db
      .update(vessels)
      .set(vesselUpdate)
      .where(eq(vessels.id, id))
      .returning();
    return updatedVessel || undefined;
  }

  async deleteVessel(id: number): Promise<boolean> {
    const result = await db.delete(vessels).where(eq(vessels.id, id));
    return true; // PostgreSQL doesn't return count of affected rows in the way we need
  }

  async getRefineries(): Promise<Refinery[]> {
    return await db.select().from(refineries);
  }

  async getRefineryById(id: number): Promise<Refinery | undefined> {
    const [refinery] = await db.select().from(refineries).where(eq(refineries.id, id));
    return refinery || undefined;
  }

  async getRefineryByRegion(region: string): Promise<Refinery[]> {
    return await db.select().from(refineries).where(eq(refineries.region, region));
  }

  async createRefinery(insertRefinery: InsertRefinery): Promise<Refinery> {
    const [refinery] = await db.insert(refineries).values(insertRefinery).returning();
    return refinery;
  }

  async updateRefinery(id: number, refineryUpdate: Partial<InsertRefinery>): Promise<Refinery | undefined> {
    const [updatedRefinery] = await db
      .update(refineries)
      .set(refineryUpdate)
      .where(eq(refineries.id, id))
      .returning();
    return updatedRefinery || undefined;
  }

  async deleteRefinery(id: number): Promise<boolean> {
    const result = await db.delete(refineries).where(eq(refineries.id, id));
    return true;
  }

  // Port methods implementation
  async getPorts(): Promise<Port[]> {
    return await db.select().from(ports);
  }

  async getPortById(id: number): Promise<Port | undefined> {
    const [port] = await db.select().from(ports).where(eq(ports.id, id));
    return port || undefined;
  }

  async getPortsByRegion(region: string): Promise<Port[]> {
    return await db.select().from(ports).where(eq(ports.region, region));
  }

  async createPort(insertPort: InsertPort): Promise<Port> {
    const [port] = await db.insert(ports).values(insertPort).returning();
    return port;
  }
  
  async createPortsBulk(insertPorts: InsertPort[]): Promise<Port[]> {
    // If no ports provided, return empty array
    if (!insertPorts || insertPorts.length === 0) {
      return [];
    }
    
    try {
      // Insert all ports in a single database operation
      const createdPorts = await db.insert(ports).values(insertPorts).returning();
      return createdPorts;
    } catch (error) {
      console.error("Error in bulk port insertion:", error);
      
      // Fall back to individual inserts if bulk insert fails
      console.log("Falling back to individual port insertions");
      const results: Port[] = [];
      
      for (const port of insertPorts) {
        try {
          const [createdPort] = await db.insert(ports).values(port).returning();
          results.push(createdPort);
        } catch (singleError) {
          console.error(`Error inserting port ${port.name}:`, singleError);
          // Continue with the next port
        }
      }
      
      return results;
    }
  }

  async updatePort(id: number, portUpdate: Partial<InsertPort>): Promise<Port | undefined> {
    const [updatedPort] = await db
      .update(ports)
      .set(portUpdate)
      .where(eq(ports.id, id))
      .returning();
    return updatedPort || undefined;
  }

  async deletePort(id: number): Promise<boolean> {
    const result = await db.delete(ports).where(eq(ports.id, id));
    return true;
  }

  async getProgressEventsByVesselId(vesselId: number): Promise<ProgressEvent[]> {
    return await db
      .select()
      .from(progressEvents)
      .where(eq(progressEvents.vesselId, vesselId))
      .orderBy(progressEvents.date);
  }

  async createProgressEvent(insertEvent: InsertProgressEvent): Promise<ProgressEvent> {
    const [event] = await db.insert(progressEvents).values(insertEvent).returning();
    return event;
  }

  async deleteProgressEvent(id: number): Promise<boolean> {
    const result = await db.delete(progressEvents).where(eq(progressEvents.id, id));
    return true;
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocumentsByVesselId(vesselId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.vesselId, vesselId));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    // Convert string dates to Date objects if present
    const documentValues = {
      ...insertDocument,
      // Convert string dates to Date objects if provided
      issueDate: insertDocument.issueDate ? new Date(insertDocument.issueDate) : undefined,
      expiryDate: insertDocument.expiryDate ? new Date(insertDocument.expiryDate) : undefined
    };
    
    const [document] = await db.insert(documents).values(documentValues).returning();
    return document;
  }

  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    // Convert string dates to Date objects if present
    const updateValues = {
      ...documentUpdate,
      // Convert string dates to Date objects if provided
      issueDate: documentUpdate.issueDate ? new Date(documentUpdate.issueDate) : undefined,
      expiryDate: documentUpdate.expiryDate ? new Date(documentUpdate.expiryDate) : undefined
    };
    
    const [updatedDocument] = await db
      .update(documents)
      .set(updateValues)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  async getBrokers(): Promise<Broker[]> {
    return await db.select().from(brokers);
  }

  async getBrokerById(id: number): Promise<Broker | undefined> {
    const [broker] = await db.select().from(brokers).where(eq(brokers.id, id));
    return broker || undefined;
  }

  async createBroker(insertBroker: InsertBroker): Promise<Broker> {
    const [broker] = await db.insert(brokers).values(insertBroker).returning();
    return broker;
  }

  async updateBroker(id: number, brokerUpdate: Partial<InsertBroker>): Promise<Broker | undefined> {
    const [updatedBroker] = await db
      .update(brokers)
      .set(brokerUpdate)
      .where(eq(brokers.id, id))
      .returning();
    return updatedBroker || undefined;
  }

  async deleteBroker(id: number): Promise<boolean> {
    const result = await db.delete(brokers).where(eq(brokers.id, id));
    return true;
  }

  async getStats(): Promise<Stats | undefined> {
    const [stats] = await db.select().from(statsTable);
    return stats || undefined;
  }

  async updateStats(statsUpdate: Partial<InsertStats>): Promise<Stats | undefined> {
    // Check if stats exist
    const existingStats = await this.getStats();
    
    if (existingStats) {
      // Update existing stats
      const [updatedStats] = await db
        .update(statsTable)
        .set({
          ...statsUpdate,
          lastUpdated: new Date()
        })
        .where(eq(statsTable.id, existingStats.id))
        .returning();
      return updatedStats;
    } else {
      // Create new stats
      const [newStats] = await db
        .insert(statsTable)
        .values({
          ...statsUpdate,
          lastUpdated: new Date()
        })
        .returning();
      return newStats;
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();