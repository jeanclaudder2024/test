import { eq, and } from "drizzle-orm";
import { db, getActiveDb } from "./db";
import {
  users, vessels, refineries, progressEvents, brokers, stats as statsTable, ports, 
  refineryPortConnections, vesselPortConnections, companies, vesselRefineryConnections,
  brokerCompanies, companyPartnerships, userBrokerConnections,
  subscriptionPlans, subscriptions, paymentMethods, invoices, landingPageContent,
  vesselDocuments, professionalDocuments, oilTypes,
  realCompanies, fakeCompanies,
  brokerDeals, brokerDocuments, oilMarketAlerts,
  User, InsertUser, 
  Vessel, InsertVessel,
  Refinery, InsertRefinery,
  ProgressEvent, InsertProgressEvent,
  Broker, InsertBroker,
  Stats, InsertStats,
  Port, InsertPort,
  RefineryPortConnection, InsertRefineryPortConnection,
  VesselPortConnection, InsertVesselPortConnection,
  VesselRefineryConnection, InsertVesselRefineryConnection,
  Company, InsertCompany,
  RealCompany, InsertRealCompany,
  FakeCompany, InsertFakeCompany,
  BrokerCompany, InsertBrokerCompany,
  CompanyPartnership, InsertCompanyPartnership,
  UserBrokerConnection, InsertUserBrokerConnection,
  SubscriptionPlan, InsertSubscriptionPlan,
  Subscription, InsertSubscription,
  PaymentMethod, InsertPaymentMethod,
  Invoice, InsertInvoice,
  LandingPageContent, InsertLandingPageContent,
  InsertVesselDocument, SelectVesselDocument,
  ProfessionalDocument, InsertProfessionalDocument,
  VesselDocumentAssociation, InsertVesselDocumentAssociation,
  landingPageSections, landingPageImages, landingPageBlocks,
  LandingPageSection, InsertLandingPageSection,
  LandingPageImage, InsertLandingPageImage,
  LandingPageBlock, InsertLandingPageBlock,
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
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Subscription Plan methods
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanBySlug(slug: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  
  // Subscription methods
  getSubscriptions(): Promise<Subscription[]>;
  getSubscriptionsWithDetails(): Promise<any[]>;
  getSubscriptionById(id: number): Promise<Subscription | undefined>;
  getSubscriptionsByUserId(userId: number): Promise<Subscription[]>;
  getActiveSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<boolean>;
  
  // Payment Method methods
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  getPaymentMethodById(id: number): Promise<PaymentMethod | undefined>;
  getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, paymentMethod: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;
  
  // Invoice methods
  getInvoices(userId: number): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  getInvoiceByStripeId(stripeInvoiceId: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

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

  // Vessel-Port Connection methods
  getVesselPortConnections(): Promise<VesselPortConnection[]>;
  getVesselPortConnectionsByVesselId(vesselId: number): Promise<VesselPortConnection[]>;
  getVesselPortConnectionsByPortId(portId: number): Promise<VesselPortConnection[]>;
  createVesselPortConnection(connection: InsertVesselPortConnection): Promise<VesselPortConnection>;
  updateVesselPortConnection(id: number, connection: Partial<InsertVesselPortConnection>): Promise<VesselPortConnection | undefined>;
  deleteVesselPortConnection(id: number): Promise<boolean>;

  // Progress Event methods
  getProgressEventsByVesselId(vesselId: number): Promise<ProgressEvent[]>;
  createProgressEvent(event: InsertProgressEvent): Promise<ProgressEvent>;
  deleteProgressEvent(id: number): Promise<boolean>;

  // Vessel Document methods
  getVesselDocuments(): Promise<SelectVesselDocument[]>;
  getVesselDocumentsByVesselId(vesselId: number): Promise<SelectVesselDocument[]>;
  createVesselDocument(document: InsertVesselDocument): Promise<SelectVesselDocument>;
  updateVesselDocument(id: number, document: Partial<InsertVesselDocument>): Promise<SelectVesselDocument | undefined>;
  deleteVesselDocument(id: number): Promise<boolean>;

  // Broker methods
  getBrokers(): Promise<Broker[]>;
  getBrokerById(id: number): Promise<Broker | undefined>;
  createBroker(broker: InsertBroker): Promise<Broker>;
  updateBroker(id: number, broker: Partial<InsertBroker>): Promise<Broker | undefined>;
  deleteBroker(id: number): Promise<boolean>;

  // Stats methods
  getStats(): Promise<Stats | undefined>;
  updateStats(stats: Partial<InsertStats>): Promise<Stats | undefined>;
  
  // Refinery-Port Connection methods
  getRefineryPortConnections(): Promise<RefineryPortConnection[]>;
  getRefineryPortConnectionById(id: number): Promise<RefineryPortConnection | undefined>;
  getRefineryPortConnectionsByRefineryId(refineryId: number): Promise<RefineryPortConnection[]>;
  getRefineryPortConnectionsByPortId(portId: number): Promise<RefineryPortConnection[]>;
  createRefineryPortConnection(connection: InsertRefineryPortConnection): Promise<RefineryPortConnection>;
  updateRefineryPortConnection(id: number, connection: Partial<InsertRefineryPortConnection>): Promise<RefineryPortConnection | undefined>;
  deleteRefineryPortConnection(id: number): Promise<boolean>;
  
  // Vessel-Refinery Connection methods
  getVesselRefineryConnections(): Promise<VesselRefineryConnection[]>;
  getVesselRefineryConnectionById(id: number): Promise<VesselRefineryConnection | undefined>;
  getVesselRefineryConnectionsByVesselId(vesselId: number): Promise<VesselRefineryConnection[]>;
  getVesselRefineryConnectionsByRefineryId(refineryId: number): Promise<VesselRefineryConnection[]>;
  createVesselRefineryConnection(connection: InsertVesselRefineryConnection): Promise<VesselRefineryConnection>;
  updateVesselRefineryConnection(id: number, connection: Partial<InsertVesselRefineryConnection>): Promise<VesselRefineryConnection | undefined>;
  deleteVesselRefineryConnection(id: number): Promise<boolean>;
  
  // Company methods
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<Company | undefined>;
  getCompaniesByRegion(region: string): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  createCompaniesBulk(companies: InsertCompany[]): Promise<Company[]>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // Real Company methods
  getRealCompanies(): Promise<RealCompany[]>;
  getRealCompanyById(id: number): Promise<RealCompany | undefined>;
  createRealCompany(company: InsertRealCompany): Promise<RealCompany>;
  updateRealCompany(id: number, company: Partial<InsertRealCompany>): Promise<RealCompany | undefined>;
  deleteRealCompany(id: number): Promise<boolean>;

  // Fake Company methods
  getFakeCompanies(): Promise<FakeCompany[]>;
  getFakeCompaniesWithRelations(): Promise<(FakeCompany & { realCompany: RealCompany })[]>;
  getFakeCompanyById(id: number): Promise<FakeCompany | undefined>;
  createFakeCompany(company: InsertFakeCompany): Promise<FakeCompany>;
  updateFakeCompany(id: number, company: Partial<InsertFakeCompany>): Promise<FakeCompany | undefined>;
  deleteFakeCompany(id: number): Promise<boolean>;
  
  // Professional Document Management methods
  getProfessionalDocuments(): Promise<ProfessionalDocument[]>;
  getProfessionalDocumentById(id: number): Promise<ProfessionalDocument | undefined>;
  createProfessionalDocument(document: InsertProfessionalDocument): Promise<ProfessionalDocument>;
  updateProfessionalDocument(id: number, document: Partial<InsertProfessionalDocument>): Promise<ProfessionalDocument | undefined>;
  deleteProfessionalDocument(id: number): Promise<boolean>;
  
  // Vessel Document Association methods
  getVesselDocuments(vesselId: number): Promise<ProfessionalDocument[]>;
  associateDocumentWithVessel(vesselId: number, documentId: number): Promise<VesselDocumentAssociation>;
  removeDocumentFromVessel(vesselId: number, documentId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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
  
  // Subscription Plan Methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
  }
  
  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }
  
  async getSubscriptionPlanBySlug(slug: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, slug));
    return plan || undefined;
  }
  
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }
  
  async updateSubscriptionPlan(id: number, planUpdate: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set({
        ...planUpdate,
        updatedAt: new Date()
      })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }
  
  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return true;
  }
  
  // Subscription Methods
  async getSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  async getSubscriptionsWithDetails(): Promise<any[]> {
    const result = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        stripeCustomerId: subscriptions.stripeCustomerId,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        billingInterval: subscriptions.billingInterval,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          isSubscribed: users.isSubscribed,
          subscriptionTier: users.subscriptionTier
        },
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          slug: subscriptionPlans.slug,
          description: subscriptionPlans.description,
          monthlyPrice: subscriptionPlans.monthlyPrice,
          yearlyPrice: subscriptionPlans.yearlyPrice,
          features: subscriptionPlans.features
        }
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .orderBy(subscriptions.createdAt);
    
    return result;
  }
  
  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription || undefined;
  }
  
  async getSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }
  
  async getActiveSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      ));
    return subscription || undefined;
  }
  
  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription || undefined;
  }
  
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }
  
  async updateSubscription(id: number, subscriptionUpdate: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        ...subscriptionUpdate,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription || undefined;
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
    return true;
  }
  
  // Payment Method Methods
  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId));
  }
  
  async getPaymentMethodById(id: number): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));
    return paymentMethod || undefined;
  }
  
  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
    const [paymentMethod] = await db
      .select()
      .from(paymentMethods)
      .where(and(
        eq(paymentMethods.userId, userId),
        eq(paymentMethods.isDefault, true)
      ));
    return paymentMethod || undefined;
  }
  
  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    // If this is set as default, unset other default payment methods for this user
    if (paymentMethod.isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.userId, paymentMethod.userId));
    }
    
    const [newPaymentMethod] = await db.insert(paymentMethods).values(paymentMethod).returning();
    return newPaymentMethod;
  }
  
  async updatePaymentMethod(id: number, paymentMethodUpdate: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    // If this is being set as default, unset other default payment methods for this user
    if (paymentMethodUpdate.isDefault) {
      // First get the payment method to find the user ID
      const [existingPaymentMethod] = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.id, id));
      
      if (existingPaymentMethod) {
        await db
          .update(paymentMethods)
          .set({ isDefault: false })
          .where(and(
            eq(paymentMethods.userId, existingPaymentMethod.userId),
            eq(paymentMethods.isDefault, true)
          ));
      }
    }
    
    const [updatedPaymentMethod] = await db
      .update(paymentMethods)
      .set({
        ...paymentMethodUpdate,
        updatedAt: new Date()
      })
      .where(eq(paymentMethods.id, id))
      .returning();
    return updatedPaymentMethod || undefined;
  }
  
  async deletePaymentMethod(id: number): Promise<boolean> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return true;
  }
  
  // Invoice Methods
  async getInvoices(userId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(invoices.invoiceDate, 'desc');
  }
  
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }
  
  async getInvoiceByStripeId(stripeInvoiceId: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.stripeInvoiceId, stripeInvoiceId));
    return invoice || undefined;
  }
  
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }
  
  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        ...invoiceUpdate,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice || undefined;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    await db.delete(invoices).where(eq(invoices.id, id));
    return true;
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
    const activeDb = getActiveDb();
    const [vessel] = await activeDb.insert(vessels).values(insertVessel).returning();
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

  async getVesselDocuments(): Promise<SelectVesselDocument[]> {
    return await db.select().from(vesselDocuments);
  }

  async getVesselDocumentsByVesselId(vesselId: number): Promise<SelectVesselDocument[]> {
    return await db
      .select()
      .from(vesselDocuments)
      .where(eq(vesselDocuments.vesselId, vesselId));
  }

  async createVesselDocument(insertDocument: InsertVesselDocument): Promise<SelectVesselDocument> {
    const [document] = await db.insert(vesselDocuments).values(insertDocument).returning();
    return document;
  }

  async updateVesselDocument(id: number, documentUpdate: Partial<InsertVesselDocument>): Promise<SelectVesselDocument | undefined> {
    const [updatedDocument] = await db
      .update(vesselDocuments)
      .set(documentUpdate)
      .where(eq(vesselDocuments.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteVesselDocument(id: number): Promise<boolean> {
    const result = await db.delete(vesselDocuments).where(eq(vesselDocuments.id, id));
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

  // Refinery-Port Connection methods
  async getRefineryPortConnections(): Promise<RefineryPortConnection[]> {
    return await db.select().from(refineryPortConnections);
  }

  async getRefineryPortConnectionById(id: number): Promise<RefineryPortConnection | undefined> {
    const [connection] = await db
      .select()
      .from(refineryPortConnections)
      .where(eq(refineryPortConnections.id, id));
    return connection || undefined;
  }

  async getRefineryPortConnectionsByRefineryId(refineryId: number): Promise<RefineryPortConnection[]> {
    return await db
      .select()
      .from(refineryPortConnections)
      .where(eq(refineryPortConnections.refineryId, refineryId));
  }

  async getRefineryPortConnectionsByPortId(portId: number): Promise<RefineryPortConnection[]> {
    return await db
      .select()
      .from(refineryPortConnections)
      .where(eq(refineryPortConnections.portId, portId));
  }

  async createRefineryPortConnection(connection: InsertRefineryPortConnection): Promise<RefineryPortConnection> {
    const [newConnection] = await db
      .insert(refineryPortConnections)
      .values(connection)
      .returning();
    return newConnection;
  }

  async updateRefineryPortConnection(id: number, connectionUpdate: Partial<InsertRefineryPortConnection>): Promise<RefineryPortConnection | undefined> {
    const [updatedConnection] = await db
      .update(refineryPortConnections)
      .set(connectionUpdate)
      .where(eq(refineryPortConnections.id, id))
      .returning();
    return updatedConnection || undefined;
  }

  async deleteRefineryPortConnection(id: number): Promise<boolean> {
    await db.delete(refineryPortConnections).where(eq(refineryPortConnections.id, id));
    return true;
  }
  
  // Vessel-Refinery Connection methods
  async getVesselRefineryConnections(): Promise<VesselRefineryConnection[]> {
    return await db.select().from(vesselRefineryConnections);
  }

  async getVesselRefineryConnectionById(id: number): Promise<VesselRefineryConnection | undefined> {
    const [connection] = await db
      .select()
      .from(vesselRefineryConnections)
      .where(eq(vesselRefineryConnections.id, id));
    return connection || undefined;
  }

  async getVesselRefineryConnectionsByVesselId(vesselId: number): Promise<VesselRefineryConnection[]> {
    return await db
      .select()
      .from(vesselRefineryConnections)
      .where(eq(vesselRefineryConnections.vesselId, vesselId));
  }

  async getVesselRefineryConnectionsByRefineryId(refineryId: number): Promise<VesselRefineryConnection[]> {
    return await db
      .select()
      .from(vesselRefineryConnections)
      .where(eq(vesselRefineryConnections.refineryId, refineryId));
  }

  async createVesselRefineryConnection(connection: InsertVesselRefineryConnection): Promise<VesselRefineryConnection> {
    const [newConnection] = await db
      .insert(vesselRefineryConnections)
      .values(connection)
      .returning();
    return newConnection;
  }

  async updateVesselRefineryConnection(id: number, connectionUpdate: Partial<InsertVesselRefineryConnection>): Promise<VesselRefineryConnection | undefined> {
    const [updatedConnection] = await db
      .update(vesselRefineryConnections)
      .set(connectionUpdate)
      .where(eq(vesselRefineryConnections.id, id))
      .returning();
    return updatedConnection || undefined;
  }

  async deleteVesselRefineryConnection(id: number): Promise<boolean> {
    await db.delete(vesselRefineryConnections).where(eq(vesselRefineryConnections.id, id));
    return true;
  }

  // Broker Company Methods
  async getBrokerCompanies(): Promise<BrokerCompany[]> {
    try {
      const companies = await db.select().from(brokerCompanies).where(eq(brokerCompanies.status, 'active'));
      return companies;
    } catch (error) {
      console.error("Error fetching broker companies:", error);
      throw new Error("Failed to fetch broker companies");
    }
  }

  async createBrokerCompany(data: InsertBrokerCompany): Promise<BrokerCompany> {
    try {
      const [company] = await db.insert(brokerCompanies).values(data).returning();
      return company;
    } catch (error) {
      console.error("Error creating broker company:", error);
      throw new Error("Failed to create broker company");
    }
  }

  // Company Partnership Methods
  async getCompanyPartnerships(brokerCompanyId?: number): Promise<CompanyPartnership[]> {
    try {
      let query = db.select().from(companyPartnerships);
      
      if (brokerCompanyId) {
        query = query.where(eq(companyPartnerships.brokerCompanyId, brokerCompanyId));
      }
      
      const partnerships = await query;
      return partnerships;
    } catch (error) {
      console.error("Error fetching company partnerships:", error);
      throw new Error("Failed to fetch company partnerships");
    }
  }

  async createCompanyPartnership(data: InsertCompanyPartnership): Promise<CompanyPartnership> {
    try {
      const [partnership] = await db.insert(companyPartnerships).values(data).returning();
      return partnership;
    } catch (error) {
      console.error("Error creating company partnership:", error);
      throw new Error("Failed to create company partnership");
    }
  }

  // User-Broker Connection Methods
  async getUserBrokerConnections(userId?: number): Promise<UserBrokerConnection[]> {
    try {
      let query = db.select().from(userBrokerConnections);
      
      if (userId) {
        query = query.where(eq(userBrokerConnections.userId, userId));
      }
      
      const connections = await query;
      return connections;
    } catch (error) {
      console.error("Error fetching user-broker connections:", error);
      throw new Error("Failed to fetch user-broker connections");
    }
  }

  async createUserBrokerConnection(data: InsertUserBrokerConnection): Promise<UserBrokerConnection> {
    try {
      const [connection] = await db.insert(userBrokerConnections).values(data).returning();
      return connection;
    } catch (error) {
      console.error("Error creating user-broker connection:", error);
      throw new Error("Failed to create user-broker connection");
    }
  }

  async updateUserBrokerConnection(id: number, data: Partial<InsertUserBrokerConnection>): Promise<UserBrokerConnection> {
    try {
      const [connection] = await db.update(userBrokerConnections)
        .set({ ...data, lastActivity: new Date() })
        .where(eq(userBrokerConnections.id, id))
        .returning();
      return connection;
    } catch (error) {
      console.error("Error updating user-broker connection:", error);
      throw new Error("Failed to update user-broker connection");
    }
  }
  
  // Company methods implementation
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompaniesByRegion(region: string): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.region, region));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }
  
  async createCompaniesBulk(insertCompanies: InsertCompany[]): Promise<Company[]> {
    // If no companies provided, return empty array
    if (!insertCompanies || insertCompanies.length === 0) {
      return [];
    }
    
    try {
      // Insert all companies in a single database operation
      const createdCompanies = await db.insert(companies).values(insertCompanies).returning();
      return createdCompanies;
    } catch (error) {
      console.error("Error in bulk company insertion:", error);
      
      // Fall back to individual inserts if bulk insert fails
      console.log("Falling back to individual company insertions");
      const results: Company[] = [];
      
      for (const company of insertCompanies) {
        try {
          const [createdCompany] = await db.insert(companies).values(company).returning();
          results.push(createdCompany);
        } catch (singleError) {
          console.error(`Error inserting company ${company.name}:`, singleError);
          // Continue with the next company
        }
      }
      
      return results;
    }
  }

  async updateCompany(id: number, companyUpdate: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(companyUpdate)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany || undefined;
  }

  async deleteCompany(id: number): Promise<boolean> {
    await db.delete(companies).where(eq(companies.id, id));
    return true;
  }
  
  /**
   * Get ports near specified coordinates within a radius (in km)
   * @param lat - Latitude
   * @param lng - Longitude
   * @param radius - Radius in kilometers
   * @returns Array of ports within the radius
   */
  async getPortsNearCoordinates(lat: number, lng: number, radius: number): Promise<Port[] | null> {
    try {
      // Simple implementation - in real application, would use geospatial queries
      // Here we'll just get all ports and filter by calculated distance
      const allPorts = await this.getPorts();
      
      const nearbyPorts = allPorts.filter(port => {
        if (!port.latitude || !port.longitude) return false;
        
        // Calculate distance using Haversine formula
        const R = 6371; // Earth radius in km
        const dLat = this.deg2rad(parseFloat(port.latitude) - lat);
        const dLon = this.deg2rad(parseFloat(port.longitude) - lng);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(this.deg2rad(lat)) * Math.cos(this.deg2rad(parseFloat(port.latitude))) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        
        return distance <= radius;
      });
      
      // Sort by distance (closest first)
      nearbyPorts.sort((a, b) => {
        const distA = this.calculateDistance(lat, lng, parseFloat(a.latitude || "0"), parseFloat(a.longitude || "0"));
        const distB = this.calculateDistance(lat, lng, parseFloat(b.latitude || "0"), parseFloat(b.longitude || "0"));
        return distA - distB;
      });
      
      return nearbyPorts;
    } catch (error) {
      console.error("Error finding ports near coordinates:", error);
      return null;
    }
  }
  
  /**
   * Helper: Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  /**
   * Helper: Calculate distance between coordinates
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  // Professional Document Management methods
  async getProfessionalDocuments(): Promise<ProfessionalDocument[]> {
    return await db.select()
      .from(professionalDocuments)
      .where(eq(professionalDocuments.isActive, true))
      .orderBy(professionalDocuments.createdAt);
  }

  async getProfessionalDocumentById(id: number): Promise<ProfessionalDocument | undefined> {
    const [document] = await db.select()
      .from(professionalDocuments)
      .where(eq(professionalDocuments.id, id));
    return document || undefined;
  }

  async createProfessionalDocument(document: InsertProfessionalDocument): Promise<ProfessionalDocument> {
    const [newDocument] = await db.insert(professionalDocuments)
      .values(document)
      .returning();
    return newDocument;
  }

  async updateProfessionalDocument(id: number, document: Partial<InsertProfessionalDocument>): Promise<ProfessionalDocument | undefined> {
    const [updatedDocument] = await db.update(professionalDocuments)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(professionalDocuments.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteProfessionalDocument(id: number): Promise<boolean> {
    const result = await db.update(professionalDocuments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(professionalDocuments.id, id));
    return result.rowCount > 0;
  }

  async getVesselDocuments(vesselId: number): Promise<ProfessionalDocument[]> {
    return await db.select({
      id: professionalDocuments.id,
      title: professionalDocuments.title,
      description: professionalDocuments.description,
      content: professionalDocuments.content,
      pdfPath: professionalDocuments.pdfPath,
      isActive: professionalDocuments.isActive,
      createdBy: professionalDocuments.createdBy,
      createdAt: professionalDocuments.createdAt,
      updatedAt: professionalDocuments.updatedAt,
    })
    .from(professionalDocuments)
    .innerJoin(vesselDocumentAssociations, eq(professionalDocuments.id, vesselDocumentAssociations.documentId))
    .where(
      and(
        eq(vesselDocumentAssociations.vesselId, vesselId),
        eq(professionalDocuments.isActive, true)
      )
    )
    .orderBy(professionalDocuments.createdAt);
  }

  async associateDocumentWithVessel(vesselId: number, documentId: number): Promise<VesselDocumentAssociation> {
    const [association] = await db.insert(vesselDocumentAssociations)
      .values({ vesselId, documentId })
      .returning();
    return association;
  }

  async removeDocumentFromVessel(vesselId: number, documentId: number): Promise<boolean> {
    const result = await db.delete(vesselDocumentAssociations)
      .where(
        and(
          eq(vesselDocumentAssociations.vesselId, vesselId),
          eq(vesselDocumentAssociations.documentId, documentId)
        )
      );
    return result.rowCount > 0;
  }

  // Real Company Methods
  async getRealCompanies(): Promise<RealCompany[]> {
    return await db.select().from(realCompanies).orderBy(realCompanies.createdAt);
  }

  async getRealCompanyById(id: number): Promise<RealCompany | undefined> {
    const [company] = await db.select().from(realCompanies).where(eq(realCompanies.id, id));
    return company || undefined;
  }

  async createRealCompany(company: InsertRealCompany): Promise<RealCompany> {
    const [newCompany] = await db.insert(realCompanies).values(company).returning();
    return newCompany;
  }

  async updateRealCompany(id: number, company: Partial<InsertRealCompany>): Promise<RealCompany | undefined> {
    const [updatedCompany] = await db
      .update(realCompanies)
      .set(company)
      .where(eq(realCompanies.id, id))
      .returning();
    return updatedCompany || undefined;
  }

  async deleteRealCompany(id: number): Promise<boolean> {
    await db.delete(realCompanies).where(eq(realCompanies.id, id));
    return true;
  }

  // Fake Company Methods
  async getFakeCompanies(): Promise<FakeCompany[]> {
    return await db.select().from(fakeCompanies).orderBy(fakeCompanies.createdAt);
  }

  async getFakeCompaniesWithRelations(): Promise<(FakeCompany & { realCompany: RealCompany })[]> {
    const results = await db
      .select({
        id: fakeCompanies.id,
        realCompanyId: fakeCompanies.realCompanyId,
        generatedName: fakeCompanies.generatedName,
        createdAt: fakeCompanies.createdAt,
        updatedAt: fakeCompanies.updatedAt,
        realCompany: {
          id: realCompanies.id,
          name: realCompanies.name,
          industry: realCompanies.industry,
          address: realCompanies.address,
          logo: realCompanies.logo,
          description: realCompanies.description,
          website: realCompanies.website,
          phone: realCompanies.phone,
          email: realCompanies.email,
          founded: realCompanies.founded,
          employees: realCompanies.employees,
          revenue: realCompanies.revenue,
          headquarters: realCompanies.headquarters,
          ceo: realCompanies.ceo,
          createdAt: realCompanies.createdAt,
          updatedAt: realCompanies.updatedAt,
        }
      })
      .from(fakeCompanies)
      .leftJoin(realCompanies, eq(fakeCompanies.realCompanyId, realCompanies.id))
      .orderBy(fakeCompanies.createdAt);
    
    return results as (FakeCompany & { realCompany: RealCompany })[];
  }

  async getFakeCompanyById(id: number): Promise<FakeCompany | undefined> {
    const [company] = await db.select().from(fakeCompanies).where(eq(fakeCompanies.id, id));
    return company || undefined;
  }

  async createFakeCompany(company: InsertFakeCompany): Promise<FakeCompany> {
    const [newCompany] = await db.insert(fakeCompanies).values(company).returning();
    return newCompany;
  }

  async updateFakeCompany(id: number, company: Partial<InsertFakeCompany>): Promise<FakeCompany | undefined> {
    const [updatedCompany] = await db
      .update(fakeCompanies)
      .set(company)
      .where(eq(fakeCompanies.id, id))
      .returning();
    return updatedCompany || undefined;
  }

  async deleteFakeCompany(id: number): Promise<boolean> {
    await db.delete(fakeCompanies).where(eq(fakeCompanies.id, id));
    return true;
  }

  // Broker Deals Methods
  async getBrokerDeals(brokerId?: number): Promise<(BrokerDeal & { fakeCompany: FakeCompany & { realCompany: RealCompany } })[]> {
    let query = db
      .select({
        id: brokerDeals.id,
        brokerId: brokerDeals.brokerId,
        fakeCompanyId: brokerDeals.fakeCompanyId,
        status: brokerDeals.status,
        dealValue: brokerDeals.dealValue,
        notes: brokerDeals.notes,
        adminNotes: brokerDeals.adminNotes,
        createdAt: brokerDeals.createdAt,
        updatedAt: brokerDeals.updatedAt,
        fakeCompany: {
          id: fakeCompanies.id,
          realCompanyId: fakeCompanies.realCompanyId,
          generatedName: fakeCompanies.generatedName,
          createdAt: fakeCompanies.createdAt,
          updatedAt: fakeCompanies.updatedAt,
          realCompany: {
            id: realCompanies.id,
            name: realCompanies.name,
            industry: realCompanies.industry,
            address: realCompanies.address,
            logo: realCompanies.logo,
            description: realCompanies.description,
            website: realCompanies.website,
            phone: realCompanies.phone,
            email: realCompanies.email,
            founded: realCompanies.founded,
            employees: realCompanies.employees,
            revenue: realCompanies.revenue,
            headquarters: realCompanies.headquarters,
            ceo: realCompanies.ceo,
            createdAt: realCompanies.createdAt,
            updatedAt: realCompanies.updatedAt,
          }
        }
      })
      .from(brokerDeals)
      .leftJoin(fakeCompanies, eq(brokerDeals.fakeCompanyId, fakeCompanies.id))
      .leftJoin(realCompanies, eq(fakeCompanies.realCompanyId, realCompanies.id));

    if (brokerId) {
      query = query.where(eq(brokerDeals.brokerId, brokerId));
    }

    return await query.orderBy(brokerDeals.createdAt);
  }

  async createBrokerDeal(deal: InsertBrokerDeal): Promise<BrokerDeal> {
    const [newDeal] = await db.insert(brokerDeals).values(deal).returning();
    return newDeal;
  }

  async updateBrokerDeal(id: number, deal: Partial<InsertBrokerDeal>): Promise<BrokerDeal | undefined> {
    const [updatedDeal] = await db
      .update(brokerDeals)
      .set({ ...deal, updatedAt: new Date() })
      .where(eq(brokerDeals.id, id))
      .returning();
    return updatedDeal || undefined;
  }

  async deleteBrokerDeal(id: number): Promise<boolean> {
    await db.delete(brokerDeals).where(eq(brokerDeals.id, id));
    return true;
  }

  // Broker Documents Methods
  async getBrokerDocuments(brokerId?: number): Promise<BrokerDocument[]> {
    let query = db.select().from(brokerDocuments);
    
    if (brokerId) {
      query = query.where(eq(brokerDocuments.brokerId, brokerId));
    }

    return await query.orderBy(brokerDocuments.createdAt);
  }

  async createBrokerDocument(document: InsertBrokerDocument): Promise<BrokerDocument> {
    const [newDocument] = await db.insert(brokerDocuments).values(document).returning();
    return newDocument;
  }

  async markDocumentAsRead(documentId: number): Promise<boolean> {
    await db
      .update(brokerDocuments)
      .set({ isRead: true })
      .where(eq(brokerDocuments.id, documentId));
    return true;
  }

  async deleteBrokerDocument(id: number): Promise<boolean> {
    await db.delete(brokerDocuments).where(eq(brokerDocuments.id, id));
    return true;
  }

  // Oil Market Alerts Methods
  async getOilMarketAlerts(brokerId?: number): Promise<OilMarketAlert[]> {
    let query = db.select().from(oilMarketAlerts).where(eq(oilMarketAlerts.isActive, true));

    const alerts = await query.orderBy(oilMarketAlerts.createdAt);

    // Filter alerts based on target brokers if brokerId is provided
    if (brokerId) {
      return alerts.filter(alert => {
        if (!alert.targetBrokers) return true; // Show to all brokers if no target specified
        try {
          const targetIds = JSON.parse(alert.targetBrokers);
          return targetIds.includes(brokerId);
        } catch {
          return true; // Show if JSON parsing fails
        }
      });
    }

    return alerts;
  }

  async createOilMarketAlert(alert: InsertOilMarketAlert): Promise<OilMarketAlert> {
    const [newAlert] = await db.insert(oilMarketAlerts).values(alert).returning();
    return newAlert;
  }

  async updateOilMarketAlert(id: number, alert: Partial<InsertOilMarketAlert>): Promise<OilMarketAlert | undefined> {
    const [updatedAlert] = await db
      .update(oilMarketAlerts)
      .set(alert)
      .where(eq(oilMarketAlerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  async deleteOilMarketAlert(id: number): Promise<boolean> {
    await db.delete(oilMarketAlerts).where(eq(oilMarketAlerts.id, id));
    return true;
  }

  // Get all brokers (users with broker role or broker plan)
  async getAllBrokers(): Promise<User[]> {
    // For now, return all users since we don't have broker role/plan logic yet
    return await db.select().from(users).orderBy(users.createdAt);
  }
}

// Use database storage
export const storage = new DatabaseStorage();