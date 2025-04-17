import { 
  User, InsertUser, 
  Vessel, InsertVessel,
  Refinery, InsertRefinery,
  ProgressEvent, InsertProgressEvent,
  Document, InsertDocument,
  Broker, InsertBroker,
  Stats, InsertStats
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vessels: Map<number, Vessel>;
  private refineries: Map<number, Refinery>;
  private progressEvents: Map<number, ProgressEvent>;
  private documents: Map<number, Document>;
  private brokers: Map<number, Broker>;
  private statsData: Stats | undefined;
  
  private userId: number;
  private vesselId: number;
  private refineryId: number;
  private progressEventId: number;
  private documentId: number;
  private brokerId: number;
  private statsId: number;

  constructor() {
    this.users = new Map();
    this.vessels = new Map();
    this.refineries = new Map();
    this.progressEvents = new Map();
    this.documents = new Map();
    this.brokers = new Map();
    
    this.userId = 1;
    this.vesselId = 1;
    this.refineryId = 1;
    this.progressEventId = 1;
    this.documentId = 1;
    this.brokerId = 1;
    this.statsId = 1;

    // Initialize with sample stats data
    this.statsData = {
      id: this.statsId,
      activeVessels: 0,
      totalCargo: "0",
      activeRefineries: 0,
      activeBrokers: 0,
      lastUpdated: new Date()
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vessel methods
  async getVessels(): Promise<Vessel[]> {
    return Array.from(this.vessels.values());
  }

  async getVesselById(id: number): Promise<Vessel | undefined> {
    return this.vessels.get(id);
  }

  async getVesselsByRegion(region: string): Promise<Vessel[]> {
    return Array.from(this.vessels.values()).filter(
      (vessel) => vessel.currentRegion === region
    );
  }

  async createVessel(insertVessel: InsertVessel): Promise<Vessel> {
    const id = this.vesselId++;
    const vessel: Vessel = { 
      ...insertVessel, 
      id,
      built: insertVessel.built ?? null,
      deadweight: insertVessel.deadweight ?? null,
      currentLat: insertVessel.currentLat ?? null,
      currentLng: insertVessel.currentLng ?? null,
      departurePort: insertVessel.departurePort ?? null,
      departureDate: insertVessel.departureDate ?? null,
      destinationPort: insertVessel.destinationPort ?? null,
      eta: insertVessel.eta ?? null,
      cargoType: insertVessel.cargoType ?? null,
      cargoCapacity: insertVessel.cargoCapacity ?? null,
      currentRegion: insertVessel.currentRegion ?? null
    };
    this.vessels.set(id, vessel);

    // Update stats
    if (this.statsData) {
      this.statsData.activeVessels = this.vessels.size;
      this.statsData.lastUpdated = new Date();
    }

    return vessel;
  }

  async updateVessel(id: number, vesselUpdate: Partial<InsertVessel>): Promise<Vessel | undefined> {
    const vessel = this.vessels.get(id);
    if (!vessel) return undefined;

    const updatedVessel: Vessel = { ...vessel, ...vesselUpdate };
    this.vessels.set(id, updatedVessel);
    return updatedVessel;
  }

  async deleteVessel(id: number): Promise<boolean> {
    const deleted = this.vessels.delete(id);
    
    // Update stats
    if (deleted && this.statsData) {
      this.statsData.activeVessels = this.vessels.size;
      this.statsData.lastUpdated = new Date();
    }
    
    return deleted;
  }

  // Refinery methods
  async getRefineries(): Promise<Refinery[]> {
    return Array.from(this.refineries.values());
  }

  async getRefineryById(id: number): Promise<Refinery | undefined> {
    return this.refineries.get(id);
  }

  async getRefineryByRegion(region: string): Promise<Refinery[]> {
    return Array.from(this.refineries.values()).filter(
      (refinery) => refinery.region === region
    );
  }

  async createRefinery(insertRefinery: InsertRefinery): Promise<Refinery> {
    const id = this.refineryId++;
    const refinery: Refinery = { 
      ...insertRefinery, 
      id,
      status: insertRefinery.status ?? null,
      capacity: insertRefinery.capacity ?? null
    };
    this.refineries.set(id, refinery);

    // Update stats
    if (this.statsData) {
      this.statsData.activeRefineries = Array.from(this.refineries.values()).filter(r => r.status === 'active').length;
      this.statsData.lastUpdated = new Date();
    }

    return refinery;
  }

  async updateRefinery(id: number, refineryUpdate: Partial<InsertRefinery>): Promise<Refinery | undefined> {
    const refinery = this.refineries.get(id);
    if (!refinery) return undefined;

    const updatedRefinery: Refinery = { ...refinery, ...refineryUpdate };
    this.refineries.set(id, updatedRefinery);

    // Update stats if status changed
    if (refineryUpdate.status && this.statsData) {
      this.statsData.activeRefineries = Array.from(this.refineries.values()).filter(r => r.status === 'active').length;
      this.statsData.lastUpdated = new Date();
    }

    return updatedRefinery;
  }

  async deleteRefinery(id: number): Promise<boolean> {
    const refinery = this.refineries.get(id);
    const deleted = this.refineries.delete(id);
    
    // Update stats
    if (deleted && refinery && refinery.status === 'active' && this.statsData) {
      this.statsData.activeRefineries = Array.from(this.refineries.values()).filter(r => r.status === 'active').length;
      this.statsData.lastUpdated = new Date();
    }
    
    return deleted;
  }

  // Progress Event methods
  async getProgressEventsByVesselId(vesselId: number): Promise<ProgressEvent[]> {
    return Array.from(this.progressEvents.values())
      .filter(event => event.vesselId === vesselId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
  }

  async createProgressEvent(insertEvent: InsertProgressEvent): Promise<ProgressEvent> {
    const id = this.progressEventId++;
    const event: ProgressEvent = { 
      ...insertEvent, 
      id,
      lat: insertEvent.lat ?? null,
      lng: insertEvent.lng ?? null,
      location: insertEvent.location ?? null
    };
    this.progressEvents.set(id, event);
    return event;
  }

  async deleteProgressEvent(id: number): Promise<boolean> {
    return this.progressEvents.delete(id);
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByVesselId(vesselId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.vesselId === vesselId)
      .sort((a, b) => {
        // Handle null createdAt dates
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      }); // Sort by date descending
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const document: Document = { 
      ...insertDocument, 
      id, 
      createdAt: new Date() 
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument: Document = { ...document, ...documentUpdate };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Broker methods
  async getBrokers(): Promise<Broker[]> {
    return Array.from(this.brokers.values());
  }

  async getBrokerById(id: number): Promise<Broker | undefined> {
    return this.brokers.get(id);
  }

  async createBroker(insertBroker: InsertBroker): Promise<Broker> {
    const id = this.brokerId++;
    const broker: Broker = { 
      ...insertBroker, 
      id,
      country: insertBroker.country ?? null,
      active: insertBroker.active ?? null,
      phone: insertBroker.phone ?? null
    };
    this.brokers.set(id, broker);

    // Update stats
    if (this.statsData) {
      this.statsData.activeBrokers = Array.from(this.brokers.values()).filter(b => b.active).length;
      this.statsData.lastUpdated = new Date();
    }

    return broker;
  }

  async updateBroker(id: number, brokerUpdate: Partial<InsertBroker>): Promise<Broker | undefined> {
    const broker = this.brokers.get(id);
    if (!broker) return undefined;

    const updatedBroker: Broker = { ...broker, ...brokerUpdate };
    this.brokers.set(id, updatedBroker);

    // Update stats if active status changed
    if (brokerUpdate.active !== undefined && this.statsData) {
      this.statsData.activeBrokers = Array.from(this.brokers.values()).filter(b => b.active).length;
      this.statsData.lastUpdated = new Date();
    }

    return updatedBroker;
  }

  async deleteBroker(id: number): Promise<boolean> {
    const broker = this.brokers.get(id);
    const deleted = this.brokers.delete(id);
    
    // Update stats
    if (deleted && broker && broker.active && this.statsData) {
      this.statsData.activeBrokers = Array.from(this.brokers.values()).filter(b => b.active).length;
      this.statsData.lastUpdated = new Date();
    }
    
    return deleted;
  }

  // Stats methods
  async getStats(): Promise<Stats | undefined> {
    return this.statsData;
  }

  async updateStats(statsUpdate: Partial<InsertStats>): Promise<Stats | undefined> {
    if (!this.statsData) return undefined;

    this.statsData = { 
      ...this.statsData, 
      ...statsUpdate, 
      lastUpdated: new Date()
    };
    
    return this.statsData;
  }
}

export const storage = new MemStorage();
