import { eq, and } from "drizzle-orm";
import { db, getActiveDb } from "./db";
import {
  users, vessels, refineries, progressEvents, stats as statsTable, ports, 
  realCompanies, fakeCompanies,
  brokerDeals, brokerDocuments, oilMarketAlerts,
  subscriptionPlans,
  User, InsertUser, 
  Vessel, InsertVessel,
  Refinery, InsertRefinery,
  ProgressEvent, InsertProgressEvent,
  Stats, InsertStats,
  Port, InsertPort,
  RealCompany, InsertRealCompany,
  FakeCompany, InsertFakeCompany,
  SubscriptionPlan, InsertSubscriptionPlan,
  BrokerDeal, InsertBrokerDeal,
  BrokerDocument, InsertBrokerDocument,
  OilMarketAlert, InsertOilMarketAlert
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Vessel methods
  getVessels(): Promise<Vessel[]>;
  getVesselById(id: number): Promise<Vessel | undefined>;
  getVesselsByRegion(region: string): Promise<Vessel[]>;
  getVesselsByPort(port: string): Promise<Vessel[]>;
  createVessel(vessel: InsertVessel): Promise<Vessel>;
  createVesselsBulk(vessels: InsertVessel[]): Promise<Vessel[]>;
  updateVessel(id: number, vessel: Partial<InsertVessel>): Promise<Vessel | undefined>;
  deleteVessel(id: number): Promise<boolean>;

  // Refinery methods
  getRefineries(): Promise<Refinery[]>;
  getRefineryById(id: number): Promise<Refinery | undefined>;
  getRefineriesByRegion(region: string): Promise<Refinery[]>;
  createRefinery(refinery: InsertRefinery): Promise<Refinery>;
  createRefineriesBulk(refineries: InsertRefinery[]): Promise<Refinery[]>;
  updateRefinery(id: number, refinery: Partial<InsertRefinery>): Promise<Refinery | undefined>;
  deleteRefinery(id: number): Promise<boolean>;

  // Port methods
  getPorts(): Promise<Port[]>;
  getPortById(id: number): Promise<Port | undefined>;
  getPortsByRegion(region: string): Promise<Port[]>;
  createPort(port: InsertPort): Promise<Port>;
  createPortsBulk(ports: InsertPort[]): Promise<Port[]>;
  updatePort(id: number, port: Partial<InsertPort>): Promise<Port | undefined>;
  deletePort(id: number): Promise<boolean>;

  // Real Company methods
  getRealCompanies(): Promise<RealCompany[]>;
  getRealCompanyById(id: number): Promise<RealCompany | undefined>;
  createRealCompany(company: InsertRealCompany): Promise<RealCompany>;
  updateRealCompany(id: number, company: Partial<InsertRealCompany>): Promise<RealCompany | undefined>;
  deleteRealCompany(id: number): Promise<boolean>;

  // Fake Company methods
  getFakeCompanies(): Promise<FakeCompany[]>;
  getFakeCompanyById(id: number): Promise<FakeCompany | undefined>;
  createFakeCompany(company: InsertFakeCompany): Promise<FakeCompany>;
  updateFakeCompany(id: number, company: Partial<InsertFakeCompany>): Promise<FakeCompany | undefined>;
  deleteFakeCompany(id: number): Promise<boolean>;

  // Subscription Plan methods
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;

  // Broker Deal methods
  getBrokerDeals(): Promise<BrokerDeal[]>;
  getBrokerDealById(id: number): Promise<BrokerDeal | undefined>;
  createBrokerDeal(deal: InsertBrokerDeal): Promise<BrokerDeal>;
  updateBrokerDeal(id: number, deal: Partial<InsertBrokerDeal>): Promise<BrokerDeal | undefined>;
  deleteBrokerDeal(id: number): Promise<boolean>;

  // Broker Document methods
  getBrokerDocuments(): Promise<BrokerDocument[]>;
  getBrokerDocumentById(id: number): Promise<BrokerDocument | undefined>;
  createBrokerDocument(document: InsertBrokerDocument): Promise<BrokerDocument>;
  updateBrokerDocument(id: number, document: Partial<InsertBrokerDocument>): Promise<BrokerDocument | undefined>;
  deleteBrokerDocument(id: number): Promise<boolean>;

  // Oil Market Alert methods
  getOilMarketAlerts(): Promise<OilMarketAlert[]>;
  getOilMarketAlertById(id: number): Promise<OilMarketAlert | undefined>;
  createOilMarketAlert(alert: InsertOilMarketAlert): Promise<OilMarketAlert>;
  updateOilMarketAlert(id: number, alert: Partial<InsertOilMarketAlert>): Promise<OilMarketAlert | undefined>;
  deleteOilMarketAlert(id: number): Promise<boolean>;

  // Progress Event methods
  getProgressEventsByVesselId(vesselId: number): Promise<ProgressEvent[]>;
  createProgressEvent(event: InsertProgressEvent): Promise<ProgressEvent>;
  deleteProgressEvent(id: number): Promise<boolean>;

  // Stats methods
  getStats(): Promise<Stats | undefined>;
  updateStats(stats: Partial<InsertStats>): Promise<Stats | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Vessel methods
  async getVessels(): Promise<Vessel[]> {
    return await db.select().from(vessels);
  }

  async getVesselById(id: number): Promise<Vessel | undefined> {
    const [vessel] = await db.select().from(vessels).where(eq(vessels.id, id));
    return vessel;
  }

  async getVesselsByRegion(region: string): Promise<Vessel[]> {
    return await db.select().from(vessels).where(eq(vessels.departurePort, region));
  }

  async getVesselsByPort(port: string): Promise<Vessel[]> {
    return await db.select().from(vessels).where(eq(vessels.departurePort, port));
  }

  async createVessel(vessel: InsertVessel): Promise<Vessel> {
    const [newVessel] = await db.insert(vessels).values(vessel).returning();
    return newVessel;
  }

  async createVesselsBulk(vesselList: InsertVessel[]): Promise<Vessel[]> {
    return await db.insert(vessels).values(vesselList).returning();
  }

  async updateVessel(id: number, vessel: Partial<InsertVessel>): Promise<Vessel | undefined> {
    const [updatedVessel] = await db.update(vessels).set(vessel).where(eq(vessels.id, id)).returning();
    return updatedVessel;
  }

  async deleteVessel(id: number): Promise<boolean> {
    const result = await db.delete(vessels).where(eq(vessels.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Refinery methods
  async getRefineries(): Promise<Refinery[]> {
    return await db.select().from(refineries);
  }

  async getRefineryById(id: number): Promise<Refinery | undefined> {
    const [refinery] = await db.select().from(refineries).where(eq(refineries.id, id));
    return refinery;
  }

  async getRefineriesByRegion(region: string): Promise<Refinery[]> {
    return await db.select().from(refineries).where(eq(refineries.country, region));
  }

  async createRefinery(refinery: InsertRefinery): Promise<Refinery> {
    const [newRefinery] = await db.insert(refineries).values(refinery).returning();
    return newRefinery;
  }

  async createRefineriesBulk(refineryList: InsertRefinery[]): Promise<Refinery[]> {
    return await db.insert(refineries).values(refineryList).returning();
  }

  async updateRefinery(id: number, refinery: Partial<InsertRefinery>): Promise<Refinery | undefined> {
    const [updatedRefinery] = await db.update(refineries).set(refinery).where(eq(refineries.id, id)).returning();
    return updatedRefinery;
  }

  async deleteRefinery(id: number): Promise<boolean> {
    const result = await db.delete(refineries).where(eq(refineries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Port methods
  async getPorts(): Promise<Port[]> {
    return await db.select().from(ports);
  }

  async getPortById(id: number): Promise<Port | undefined> {
    const [port] = await db.select().from(ports).where(eq(ports.id, id));
    return port;
  }

  async getPortsByRegion(region: string): Promise<Port[]> {
    return await db.select().from(ports).where(eq(ports.region, region));
  }

  async createPort(port: InsertPort): Promise<Port> {
    const [newPort] = await db.insert(ports).values(port).returning();
    return newPort;
  }

  async createPortsBulk(portList: InsertPort[]): Promise<Port[]> {
    return await db.insert(ports).values(portList).returning();
  }

  async updatePort(id: number, port: Partial<InsertPort>): Promise<Port | undefined> {
    const [updatedPort] = await db.update(ports).set(port).where(eq(ports.id, id)).returning();
    return updatedPort;
  }

  async deletePort(id: number): Promise<boolean> {
    const result = await db.delete(ports).where(eq(ports.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Real Company methods
  async getRealCompanies(): Promise<RealCompany[]> {
    return await db.select().from(realCompanies);
  }

  async getRealCompanyById(id: number): Promise<RealCompany | undefined> {
    const [company] = await db.select().from(realCompanies).where(eq(realCompanies.id, id));
    return company;
  }

  async createRealCompany(company: InsertRealCompany): Promise<RealCompany> {
    const [newCompany] = await db.insert(realCompanies).values(company).returning();
    return newCompany;
  }

  async updateRealCompany(id: number, company: Partial<InsertRealCompany>): Promise<RealCompany | undefined> {
    const [updatedCompany] = await db.update(realCompanies).set(company).where(eq(realCompanies.id, id)).returning();
    return updatedCompany;
  }

  async deleteRealCompany(id: number): Promise<boolean> {
    const result = await db.delete(realCompanies).where(eq(realCompanies.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Fake Company methods
  async getFakeCompanies(): Promise<FakeCompany[]> {
    return await db.select().from(fakeCompanies);
  }

  async getFakeCompanyById(id: number): Promise<FakeCompany | undefined> {
    const [company] = await db.select().from(fakeCompanies).where(eq(fakeCompanies.id, id));
    return company;
  }

  async createFakeCompany(company: InsertFakeCompany): Promise<FakeCompany> {
    const [newCompany] = await db.insert(fakeCompanies).values(company).returning();
    return newCompany;
  }

  async updateFakeCompany(id: number, company: Partial<InsertFakeCompany>): Promise<FakeCompany | undefined> {
    const [updatedCompany] = await db.update(fakeCompanies).set(company).where(eq(fakeCompanies.id, id)).returning();
    return updatedCompany;
  }

  async deleteFakeCompany(id: number): Promise<boolean> {
    const result = await db.delete(fakeCompanies).where(eq(fakeCompanies.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Subscription Plan methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db.update(subscriptionPlans).set(plan).where(eq(subscriptionPlans.id, id)).returning();
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Broker Deal methods
  async getBrokerDeals(): Promise<BrokerDeal[]> {
    return await db.select().from(brokerDeals);
  }

  async getBrokerDealById(id: number): Promise<BrokerDeal | undefined> {
    const [deal] = await db.select().from(brokerDeals).where(eq(brokerDeals.id, id));
    return deal;
  }

  async createBrokerDeal(deal: InsertBrokerDeal): Promise<BrokerDeal> {
    const [newDeal] = await db.insert(brokerDeals).values(deal).returning();
    return newDeal;
  }

  async updateBrokerDeal(id: number, deal: Partial<InsertBrokerDeal>): Promise<BrokerDeal | undefined> {
    const [updatedDeal] = await db.update(brokerDeals).set(deal).where(eq(brokerDeals.id, id)).returning();
    return updatedDeal;
  }

  async deleteBrokerDeal(id: number): Promise<boolean> {
    const result = await db.delete(brokerDeals).where(eq(brokerDeals.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Broker Document methods
  async getBrokerDocuments(): Promise<BrokerDocument[]> {
    return await db.select().from(brokerDocuments);
  }

  async getBrokerDocumentById(id: number): Promise<BrokerDocument | undefined> {
    const [document] = await db.select().from(brokerDocuments).where(eq(brokerDocuments.id, id));
    return document;
  }

  async createBrokerDocument(document: InsertBrokerDocument): Promise<BrokerDocument> {
    const [newDocument] = await db.insert(brokerDocuments).values(document).returning();
    return newDocument;
  }

  async updateBrokerDocument(id: number, document: Partial<InsertBrokerDocument>): Promise<BrokerDocument | undefined> {
    const [updatedDocument] = await db.update(brokerDocuments).set(document).where(eq(brokerDocuments.id, id)).returning();
    return updatedDocument;
  }

  async deleteBrokerDocument(id: number): Promise<boolean> {
    const result = await db.delete(brokerDocuments).where(eq(brokerDocuments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Oil Market Alert methods
  async getOilMarketAlerts(): Promise<OilMarketAlert[]> {
    return await db.select().from(oilMarketAlerts);
  }

  async getOilMarketAlertById(id: number): Promise<OilMarketAlert | undefined> {
    const [alert] = await db.select().from(oilMarketAlerts).where(eq(oilMarketAlerts.id, id));
    return alert;
  }

  async createOilMarketAlert(alert: InsertOilMarketAlert): Promise<OilMarketAlert> {
    const [newAlert] = await db.insert(oilMarketAlerts).values(alert).returning();
    return newAlert;
  }

  async updateOilMarketAlert(id: number, alert: Partial<InsertOilMarketAlert>): Promise<OilMarketAlert | undefined> {
    const [updatedAlert] = await db.update(oilMarketAlerts).set(alert).where(eq(oilMarketAlerts.id, id)).returning();
    return updatedAlert;
  }

  async deleteOilMarketAlert(id: number): Promise<boolean> {
    const result = await db.delete(oilMarketAlerts).where(eq(oilMarketAlerts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Progress Event methods
  async getProgressEventsByVesselId(vesselId: number): Promise<ProgressEvent[]> {
    return await db.select().from(progressEvents).where(eq(progressEvents.vesselId, vesselId));
  }

  async createProgressEvent(event: InsertProgressEvent): Promise<ProgressEvent> {
    const [newEvent] = await db.insert(progressEvents).values(event).returning();
    return newEvent;
  }

  async deleteProgressEvent(id: number): Promise<boolean> {
    const result = await db.delete(progressEvents).where(eq(progressEvents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Stats methods
  async getStats(): Promise<Stats | undefined> {
    const [statsData] = await db.select().from(statsTable);
    return statsData;
  }

  async updateStats(stats: Partial<InsertStats>): Promise<Stats | undefined> {
    const [updatedStats] = await db.update(statsTable).set(stats).returning();
    return updatedStats;
  }
}

export const storage = new DatabaseStorage();