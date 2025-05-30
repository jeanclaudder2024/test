import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  vessels, 
  refineries, 
  ports, 
  brokers, 
  companies, 
  documents, 
  users,
  type Vessel,
  type Refinery,
  type Port,
  type Broker,
  type Company,
  type Document,
  type User
} from "@shared/schema";

export interface IStorage {
  // Vessel operations
  getVessels(): Promise<Vessel[]>;
  getVessel(id: number): Promise<Vessel | undefined>;
  createVessel(vessel: Omit<Vessel, "id">): Promise<Vessel>;
  updateVessel(id: number, vessel: Partial<Vessel>): Promise<Vessel | undefined>;
  deleteVessel(id: number): Promise<boolean>;

  // Port operations  
  getPorts(): Promise<Port[]>;
  getPort(id: number): Promise<Port | undefined>;
  createPort(port: Omit<Port, "id">): Promise<Port>;

  // Refinery operations
  getRefineries(): Promise<Refinery[]>;
  getRefinery(id: number): Promise<Refinery | undefined>;
  createRefinery(refinery: Omit<Refinery, "id">): Promise<Refinery>;

  // Broker operations
  getBrokers(): Promise<Broker[]>;
  getBroker(id: number): Promise<Broker | undefined>;
  createBroker(broker: Omit<Broker, "id">): Promise<Broker>;

  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;

  // Document operations
  getDocuments(vesselId?: number): Promise<Document[]>;
  createDocument(document: Omit<Document, "id">): Promise<Document>;

  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
}

class SupabaseStorage implements IStorage {
  // Vessel operations
  async getVessels(): Promise<Vessel[]> {
    return await db.select().from(vessels);
  }

  async getVessel(id: number): Promise<Vessel | undefined> {
    const result = await db.select().from(vessels).where(eq(vessels.id, id)).limit(1);
    return result[0];
  }

  async createVessel(vessel: Omit<Vessel, "id">): Promise<Vessel> {
    const result = await db.insert(vessels).values(vessel).returning();
    return result[0];
  }

  async updateVessel(id: number, vessel: Partial<Vessel>): Promise<Vessel | undefined> {
    const result = await db.update(vessels).set(vessel).where(eq(vessels.id, id)).returning();
    return result[0];
  }

  async deleteVessel(id: number): Promise<boolean> {
    const result = await db.delete(vessels).where(eq(vessels.id, id));
    return true;
  }

  // Port operations
  async getPorts(): Promise<Port[]> {
    return await db.select().from(ports);
  }

  async getPort(id: number): Promise<Port | undefined> {
    const result = await db.select().from(ports).where(eq(ports.id, id)).limit(1);
    return result[0];
  }

  async createPort(port: Omit<Port, "id">): Promise<Port> {
    const result = await db.insert(ports).values(port).returning();
    return result[0];
  }

  // Refinery operations
  async getRefineries(): Promise<Refinery[]> {
    return await db.select().from(refineries);
  }

  async getRefinery(id: number): Promise<Refinery | undefined> {
    const result = await db.select().from(refineries).where(eq(refineries.id, id)).limit(1);
    return result[0];
  }

  async createRefinery(refinery: Omit<Refinery, "id">): Promise<Refinery> {
    const result = await db.insert(refineries).values(refinery).returning();
    return result[0];
  }

  // Broker operations
  async getBrokers(): Promise<Broker[]> {
    return await db.select().from(brokers);
  }

  async getBroker(id: number): Promise<Broker | undefined> {
    const result = await db.select().from(brokers).where(eq(brokers.id, id)).limit(1);
    return result[0];
  }

  async createBroker(broker: Omit<Broker, "id">): Promise<Broker> {
    const result = await db.insert(brokers).values(broker).returning();
    return result[0];
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return result[0];
  }

  // Document operations
  async getDocuments(vesselId?: number): Promise<Document[]> {
    if (vesselId) {
      return await db.select().from(documents).where(eq(documents.vesselId, vesselId));
    }
    return await db.select().from(documents);
  }

  async createDocument(document: Omit<Document, "id">): Promise<Document> {
    const result = await db.insert(documents).values(document).returning();
    return result[0];
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
}

export const storage = new SupabaseStorage();