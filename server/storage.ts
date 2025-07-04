import { eq, and, sql, desc } from "drizzle-orm";
import { db, getActiveDb } from "./db";
import {
  users, vessels, refineries, progressEvents, brokers, stats as statsTable, ports, 
  refineryPortConnections, vesselPortConnections, companies, vesselRefineryConnections,
  brokerCompanies, companyPartnerships, userBrokerConnections,
  subscriptionPlans, subscriptions, paymentMethods, invoices, landingPageContent,
  vesselDocuments, professionalDocuments, oilTypes,
  realCompanies, fakeCompanies,
  brokerDeals, brokerDocuments, adminBrokerFiles, brokerDealActivities, brokerStats,
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
  BrokerDeal, InsertBrokerDeal,
  BrokerDocument, InsertBrokerDocument,
  AdminBrokerFile, InsertAdminBrokerFile,
  BrokerDealActivity, InsertBrokerDealActivity,
  BrokerStats, InsertBrokerStats,
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
  regions, OilType, InsertOilType, Region, InsertRegion,
  maritimeDocuments, MaritimeDocument, InsertMaritimeDocument,
  adminDocuments, AdminDocument, InsertAdminDocument,
  documentTemplates, DocumentTemplate, InsertDocumentTemplate,
  generatedDocuments, GeneratedDocument, InsertGeneratedDocument
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
  getProfessionalDocuments(): Promise<any[]>;
  getProfessionalDocumentById(id: number): Promise<ProfessionalDocument | undefined>;
  createProfessionalDocument(document: InsertProfessionalDocument): Promise<ProfessionalDocument>;
  updateProfessionalDocument(id: number, document: Partial<InsertProfessionalDocument>): Promise<ProfessionalDocument | undefined>;
  deleteProfessionalDocument(id: number): Promise<boolean>;
  
  // Vessel Document Association methods
  getVesselDocuments(vesselId: number): Promise<ProfessionalDocument[]>;
  associateDocumentWithVessel(vesselId: number, documentId: number): Promise<VesselDocumentAssociation>;
  removeDocumentFromVessel(vesselId: number, documentId: number): Promise<boolean>;
  
  // Oil Types Filter Management methods
  getOilTypes(): Promise<OilType[]>;
  getOilTypeById(id: number): Promise<OilType | undefined>;
  createOilType(oilType: InsertOilType): Promise<OilType>;
  updateOilType(id: number, oilType: Partial<InsertOilType>): Promise<OilType | undefined>;
  deleteOilType(id: number): Promise<boolean>;
  
  // Regions Filter Management methods
  getRegions(): Promise<Region[]>;
  getRegionById(id: number): Promise<Region | undefined>;
  createRegion(region: InsertRegion): Promise<Region>;
  updateRegion(id: number, region: Partial<InsertRegion>): Promise<Region | undefined>;
  deleteRegion(id: number): Promise<boolean>;

  // Maritime Document Management Methods
  getMaritimeDocuments(): Promise<MaritimeDocument[]>;
  getMaritimeDocumentById(id: number): Promise<MaritimeDocument | undefined>;
  createMaritimeDocument(document: InsertMaritimeDocument): Promise<MaritimeDocument>;
  updateMaritimeDocument(id: number, updates: Partial<InsertMaritimeDocument>): Promise<MaritimeDocument | undefined>;
  deleteMaritimeDocument(id: number): Promise<boolean>;

  // Admin Document Management Methods (for vessel association)
  getDocuments(): Promise<AdminDocument[]>;
  getDocumentById(id: number): Promise<AdminDocument | undefined>;
  createDocument(document: InsertAdminDocument): Promise<AdminDocument>;
  updateDocument(id: number, updates: Partial<InsertAdminDocument>): Promise<AdminDocument | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  getDocumentsByVesselId(vesselId: number): Promise<AdminDocument[]>;

  // Article Template Management Methods
  getArticleTemplates(): Promise<any[]>;
  getArticleTemplateById(id: number): Promise<any | undefined>;
  createArticleTemplate(template: any): Promise<any>;
  updateArticleTemplate(id: number, updates: any): Promise<any | undefined>;
  deleteArticleTemplate(id: number): Promise<boolean>;
  createGeneratedDocument(document: any): Promise<any>;
  getGeneratedDocumentsByVessel(vesselId: number): Promise<any[]>;
  getGeneratedArticles(): Promise<any[]>;
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
    console.log(`Storage: Attempting to delete port with ID: ${id}`);
    
    // First check if port exists
    const existingPort = await this.getPortById(id);
    if (!existingPort) {
      console.log(`Storage: Port ${id} does not exist`);
      return false;
    }
    
    console.log(`Storage: Found port "${existingPort.name}" to delete`);
    
    try {
      // First, find any vessels that reference this port and update them
      console.log(`Storage: Checking for vessel references to port ${id} (${existingPort.name})`);
      
      // Since the database has foreign key constraints, we need to use direct SQL to update vessels
      // that reference this port as an integer foreign key
      let updatedCount = 0;
      
      try {
        // Import the postgres pool for direct SQL execution
        const { pool } = await import('./db');
        
        // Update vessels where departure_port equals the port ID (as integer foreign key)
        const departureUpdateResult = await pool.query(`
          UPDATE vessels 
          SET departure_port = NULL 
          WHERE departure_port = $1::text
        `, [id]);
        
        // Update vessels where destination_port equals the port ID (as integer foreign key)  
        const destinationUpdateResult = await pool.query(`
          UPDATE vessels 
          SET destination_port = NULL 
          WHERE destination_port = $1::text
        `, [id]);
        
        updatedCount = (departureUpdateResult?.rowCount || 0) + (destinationUpdateResult?.rowCount || 0);
        console.log(`Storage: Updated ${updatedCount} vessels with foreign key references to port ${id}`);
        
      } catch (sqlError) {
        console.log(`Storage: Direct SQL update failed, trying Drizzle approach...`, sqlError);
        
        // Fallback to Drizzle ORM approach
        const allVessels = await db.select().from(vessels);
        
        for (const vessel of allVessels) {
          let needsUpdate = false;
          const updates: any = {};
          
          // Check if departure port references this port (by integer ID, string ID, or name)
          if (vessel.departurePort === id || 
              vessel.departurePort === id.toString() || 
              vessel.departurePort === existingPort.name ||
              (vessel.departurePort && typeof vessel.departurePort === 'string' && vessel.departurePort.includes(existingPort.name))) {
            updates.departurePort = null;
            needsUpdate = true;
          }
          
          // Check if destination port references this port (by integer ID, string ID, or name)
          if (vessel.destinationPort === id || 
              vessel.destinationPort === id.toString() || 
              vessel.destinationPort === existingPort.name ||
              (vessel.destinationPort && typeof vessel.destinationPort === 'string' && vessel.destinationPort.includes(existingPort.name))) {
            updates.destinationPort = null;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            await db.update(vessels)
              .set(updates)
              .where(eq(vessels.id, vessel.id));
            updatedCount++;
          }
        }
      }
      
      console.log(`Storage: Updated ${updatedCount} vessels that referenced port ${id}`);
      
      // Now try to delete the port
      console.log(`Storage: Attempting to delete port ${id} after removing all references`);
      const result = await db.delete(ports).where(eq(ports.id, id));
      console.log(`Storage: Delete result:`, result);
      
      // Verify deletion by trying to find the port again
      const verifyDeleted = await this.getPortById(id);
      if (verifyDeleted) {
        console.log(`Storage: ERROR - Port ${id} still exists after delete`);
        return false;
      }
      
      console.log(`Storage: Successfully deleted port ${id} and removed all references`);
      return true;
    } catch (error) {
      console.error(`Storage: Error deleting port ${id}:`, error);
      return false;
    }
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
  async getProfessionalDocuments(): Promise<any[]> {
    // Use vessel documents table instead of professional documents table
    return await db.select({
      id: vesselDocuments.id,
      vesselId: vesselDocuments.vesselId,
      documentType: vesselDocuments.documentType,
      title: vesselDocuments.title,
      description: vesselDocuments.description,
      content: vesselDocuments.content,
      filePath: vesselDocuments.filePath,
      fileSize: vesselDocuments.fileSize,
      mimeType: vesselDocuments.mimeType,
      version: vesselDocuments.version,
      status: vesselDocuments.status,
      isRequired: vesselDocuments.isRequired,
      expiryDate: vesselDocuments.expiryDate,
      createdBy: vesselDocuments.createdBy,
      approvedBy: vesselDocuments.approvedBy,
      approvedAt: vesselDocuments.approvedAt,
      tags: vesselDocuments.tags,
      metadata: vesselDocuments.metadata,
      createdAt: vesselDocuments.createdAt,
    })
      .from(vesselDocuments)
      .orderBy(vesselDocuments.createdAt);
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

  async getProfessionalDocumentsByVesselId(vesselId: number): Promise<ProfessionalDocument[]> {
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
  async getBrokerDeals(brokerId: number): Promise<(BrokerDeal & { companyName: string; documentsCount: number })[]> {
    const results = await db
      .select({
        id: brokerDeals.id,
        brokerId: brokerDeals.brokerId,
        companyId: brokerDeals.companyId,
        dealTitle: brokerDeals.dealTitle,
        dealValue: brokerDeals.dealValue,
        status: brokerDeals.status,
        progress: brokerDeals.progress,
        oilType: brokerDeals.oilType,
        quantity: brokerDeals.quantity,
        startDate: brokerDeals.startDate,
        expectedCloseDate: brokerDeals.expectedCloseDate,
        actualCloseDate: brokerDeals.actualCloseDate,
        notes: brokerDeals.notes,
        commissionRate: brokerDeals.commissionRate,
        commissionAmount: brokerDeals.commissionAmount,
        metadata: brokerDeals.metadata,
        createdAt: brokerDeals.createdAt,
        updatedAt: brokerDeals.updatedAt,
        companyName: realCompanies.name,
        documentsCount: sql<number>`COALESCE(doc_count.count, 0)`,
      })
      .from(brokerDeals)
      .leftJoin(realCompanies, eq(brokerDeals.companyId, realCompanies.id))
      .leftJoin(
        db.select({ dealId: brokerDocuments.dealId, count: sql<number>`count(*)` })
          .from(brokerDocuments)
          .groupBy(brokerDocuments.dealId)
          .as('doc_count'),
        eq(brokerDeals.id, sql`doc_count.deal_id`)
      )
      .where(eq(brokerDeals.brokerId, brokerId))
      .orderBy(brokerDeals.createdAt);

    return results as (BrokerDeal & { companyName: string; documentsCount: number })[];
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
  async getBrokerDocuments(brokerId: number): Promise<BrokerDocument[]> {
    return await db
      .select()
      .from(brokerDocuments)
      .where(eq(brokerDocuments.brokerId, brokerId))
      .orderBy(brokerDocuments.createdAt);
  }

  async getBrokerDocumentsByDeal(dealId: number): Promise<BrokerDocument[]> {
    return await db
      .select()
      .from(brokerDocuments)
      .where(eq(brokerDocuments.dealId, dealId))
      .orderBy(brokerDocuments.createdAt);
  }

  async createBrokerDocument(document: InsertBrokerDocument): Promise<BrokerDocument> {
    const [newDocument] = await db.insert(brokerDocuments).values(document).returning();
    return newDocument;
  }

  async incrementDocumentDownloadCount(id: number): Promise<void> {
    await db
      .update(brokerDocuments)
      .set({ downloadCount: sql`${brokerDocuments.downloadCount} + 1` })
      .where(eq(brokerDocuments.id, id));
  }

  async deleteBrokerDocument(id: number): Promise<boolean> {
    await db.delete(brokerDocuments).where(eq(brokerDocuments.id, id));
    return true;
  }

  // Admin Broker Files Methods
  async getAdminBrokerFiles(brokerId: number): Promise<(AdminBrokerFile & { sentByName: string })[]> {
    const results = await db
      .select({
        id: adminBrokerFiles.id,
        brokerId: adminBrokerFiles.brokerId,
        sentByUserId: adminBrokerFiles.sentByUserId,
        fileName: adminBrokerFiles.fileName,
        originalName: adminBrokerFiles.originalName,
        fileType: adminBrokerFiles.fileType,
        fileSize: adminBrokerFiles.fileSize,
        filePath: adminBrokerFiles.filePath,
        description: adminBrokerFiles.description,
        category: adminBrokerFiles.category,
        priority: adminBrokerFiles.priority,
        isRead: adminBrokerFiles.isRead,
        readAt: adminBrokerFiles.readAt,
        expiresAt: adminBrokerFiles.expiresAt,
        requiresSignature: adminBrokerFiles.requiresSignature,
        signedAt: adminBrokerFiles.signedAt,
        notes: adminBrokerFiles.notes,
        createdAt: adminBrokerFiles.createdAt,
        updatedAt: adminBrokerFiles.updatedAt,
        sentByName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      })
      .from(adminBrokerFiles)
      .leftJoin(users, eq(adminBrokerFiles.sentByUserId, users.id))
      .where(eq(adminBrokerFiles.brokerId, brokerId))
      .orderBy(adminBrokerFiles.createdAt);

    return results as (AdminBrokerFile & { sentByName: string })[];
  }

  async createAdminBrokerFile(file: InsertAdminBrokerFile): Promise<AdminBrokerFile> {
    const [newFile] = await db.insert(adminBrokerFiles).values(file).returning();
    return newFile;
  }

  async markAdminFileAsRead(fileId: number): Promise<void> {
    await db
      .update(adminBrokerFiles)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(adminBrokerFiles.id, fileId));
  }

  async deleteAdminBrokerFile(id: number): Promise<boolean> {
    await db.delete(adminBrokerFiles).where(eq(adminBrokerFiles.id, id));
    return true;
  }

  // Broker Statistics Methods
  async getBrokerStats(brokerId: number): Promise<BrokerStats | undefined> {
    const [stats] = await db
      .select()
      .from(brokerStats)
      .where(eq(brokerStats.brokerId, brokerId));
    return stats || undefined;
  }

  async updateBrokerStats(brokerId: number): Promise<BrokerStats> {
    // Calculate fresh statistics
    const deals = await db
      .select()
      .from(brokerDeals)
      .where(eq(brokerDeals.brokerId, brokerId));

    const totalDeals = deals.length;
    const activeDeals = deals.filter(d => d.status === 'active').length;
    const completedDeals = deals.filter(d => d.status === 'completed').length;
    const cancelledDeals = deals.filter(d => d.status === 'cancelled').length;
    
    const totalValue = deals.reduce((sum, deal) => {
      const value = parseFloat(deal.dealValue.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + value;
    }, 0).toString();

    const successRate = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0;
    const averageDealSize = totalDeals > 0 ? (parseFloat(totalValue) / totalDeals).toString() : '0';

    const statsData: Partial<InsertBrokerStats> = {
      brokerId,
      totalDeals,
      activeDeals,
      completedDeals,
      cancelledDeals,
      totalValue,
      successRate,
      averageDealSize,
      lastActivityAt: new Date(),
    };

    // Upsert statistics
    const [updatedStats] = await db
      .insert(brokerStats)
      .values(statsData as InsertBrokerStats)
      .onConflictDoUpdate({
        target: brokerStats.brokerId,
        set: {
          ...statsData,
          updatedAt: new Date(),
        },
      })
      .returning();

    return updatedStats;
  }

  // Broker Deal Activities Methods
  async createBrokerDealActivity(activity: InsertBrokerDealActivity): Promise<BrokerDealActivity> {
    const [newActivity] = await db.insert(brokerDealActivities).values(activity).returning();
    return newActivity;
  }

  async getBrokerDealActivities(dealId: number): Promise<(BrokerDealActivity & { userName: string })[]> {
    const results = await db
      .select({
        id: brokerDealActivities.id,
        dealId: brokerDealActivities.dealId,
        userId: brokerDealActivities.userId,
        activityType: brokerDealActivities.activityType,
        description: brokerDealActivities.description,
        oldValue: brokerDealActivities.oldValue,
        newValue: brokerDealActivities.newValue,
        metadata: brokerDealActivities.metadata,
        createdAt: brokerDealActivities.createdAt,
        userName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      })
      .from(brokerDealActivities)
      .leftJoin(users, eq(brokerDealActivities.userId, users.id))
      .where(eq(brokerDealActivities.dealId, dealId))
      .orderBy(brokerDealActivities.createdAt);

    return results as (BrokerDealActivity & { userName: string })[];
  }

  // Admin Broker Management Methods
  async getBrokerUsers(): Promise<any[]> {
    try {
      const brokerUsers = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
        .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
        .where(eq(subscriptionPlans.name, 'brokers'));

      return brokerUsers;
    } catch (error) {
      console.error('Error fetching broker users:', error);
      return [];
    }
  }

  async createBrokerUser(userData: { email: string; firstName: string; lastName: string; password: string; role: string }): Promise<any> {
    try {
      // Create user
      const [user] = await db.insert(users).values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        role: userData.role,
      }).returning();

      // Get broker subscription plan
      const [brokerPlan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.name, 'brokers'))
        .limit(1);

      if (brokerPlan) {
        // Create subscription for broker
        await db.insert(userSubscriptions).values({
          userId: user.id,
          planId: brokerPlan.id,
          status: 'active',
          billingInterval: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
      }

      return user;
    } catch (error) {
      console.error('Error creating broker user:', error);
      throw error;
    }
  }

  async getAllBrokerDeals(): Promise<any[]> {
    try {
      const deals = await db
        .select({
          id: brokerDeals.id,
          brokerId: brokerDeals.brokerId,
          title: brokerDeals.title,
          description: brokerDeals.description,
          status: brokerDeals.status,
          requestedAmount: brokerDeals.requestedAmount,
          oilType: brokerDeals.oilType,
          quantity: brokerDeals.quantity,
          deliveryDate: brokerDeals.deliveryDate,
          createdAt: brokerDeals.createdAt,
          brokerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        })
        .from(brokerDeals)
        .leftJoin(users, eq(brokerDeals.brokerId, users.id))
        .orderBy(desc(brokerDeals.createdAt));

      return deals;
    } catch (error) {
      console.error('Error fetching all broker deals:', error);
      return [];
    }
  }

  async updateBrokerDealStatus(dealId: number, status: string): Promise<any> {
    try {
      const [updatedDeal] = await db
        .update(brokerDeals)
        .set({ 
          status: status as any,
          updatedAt: new Date()
        })
        .where(eq(brokerDeals.id, dealId))
        .returning();

      return updatedDeal;
    } catch (error) {
      console.error('Error updating broker deal status:', error);
      throw error;
    }
  }

  async getAllAdminBrokerFiles(): Promise<any[]> {
    try {
      const files = await db
        .select({
          id: adminBrokerFiles.id,
          brokerId: adminBrokerFiles.brokerId,
          fileName: adminBrokerFiles.fileName,
          originalName: adminBrokerFiles.originalName,
          fileType: adminBrokerFiles.fileType,
          fileSize: adminBrokerFiles.fileSize,
          description: adminBrokerFiles.description,
          category: adminBrokerFiles.category,
          priority: adminBrokerFiles.priority,
          isRead: adminBrokerFiles.isRead,
          readAt: adminBrokerFiles.readAt,
          createdAt: adminBrokerFiles.createdAt,
          brokerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        })
        .from(adminBrokerFiles)
        .leftJoin(users, eq(adminBrokerFiles.brokerId, users.id))
        .orderBy(desc(adminBrokerFiles.createdAt));

      return files;
    } catch (error) {
      console.error('Error fetching all admin broker files:', error);
      return [];
    }
  }

  // Oil Types Filter Management methods
  async getOilTypes(): Promise<OilType[]> {
    try {
      return await db.select().from(oilTypes).orderBy(oilTypes.name);
    } catch (error) {
      console.error('Error fetching oil types:', error);
      return [];
    }
  }

  async getOilTypeById(id: number): Promise<OilType | undefined> {
    try {
      const [oilType] = await db.select().from(oilTypes).where(eq(oilTypes.id, id));
      return oilType;
    } catch (error) {
      console.error('Error fetching oil type by ID:', error);
      return undefined;
    }
  }

  async createOilType(oilType: InsertOilType): Promise<OilType> {
    try {
      const [newOilType] = await db.insert(oilTypes).values(oilType).returning();
      return newOilType;
    } catch (error) {
      console.error('Error creating oil type:', error);
      throw error;
    }
  }

  async updateOilType(id: number, oilType: Partial<InsertOilType>): Promise<OilType | undefined> {
    try {
      const [updatedOilType] = await db
        .update(oilTypes)
        .set(oilType)
        .where(eq(oilTypes.id, id))
        .returning();
      return updatedOilType;
    } catch (error) {
      console.error('Error updating oil type:', error);
      return undefined;
    }
  }

  async deleteOilType(id: number): Promise<boolean> {
    try {
      console.log('Attempting to delete oil type with ID:', id);
      const result = await db.delete(oilTypes).where(eq(oilTypes.id, id)).returning();
      console.log('Delete result:', result);
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting oil type:', error);
      return false;
    }
  }

  // Regions Filter Management methods
  async getRegions(): Promise<Region[]> {
    try {
      return await db.select().from(regions).orderBy(regions.name);
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  }

  async getRegionById(id: number): Promise<Region | undefined> {
    try {
      const [region] = await db.select().from(regions).where(eq(regions.id, id));
      return region;
    } catch (error) {
      console.error('Error fetching region by ID:', error);
      return undefined;
    }
  }

  async createRegion(region: InsertRegion): Promise<Region> {
    try {
      const [newRegion] = await db.insert(regions).values(region).returning();
      return newRegion;
    } catch (error) {
      console.error('Error creating region:', error);
      throw error;
    }
  }

  async updateRegion(id: number, region: Partial<InsertRegion>): Promise<Region | undefined> {
    try {
      const [updatedRegion] = await db
        .update(regions)
        .set({ ...region, updatedAt: new Date() })
        .where(eq(regions.id, id))
        .returning();
      return updatedRegion;
    } catch (error) {
      console.error('Error updating region:', error);
      return undefined;
    }
  }

  async deleteRegion(id: number): Promise<boolean> {
    try {
      const result = await db.delete(regions).where(eq(regions.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting region:', error);
      return false;
    }
  }

  // Document Management Methods
  // Maritime Document Management Methods
  async getMaritimeDocuments(): Promise<MaritimeDocument[]> {
    try {
      return await db.select().from(maritimeDocuments).orderBy(maritimeDocuments.createdAt);
    } catch (error) {
      console.error('Error fetching maritime documents:', error);
      return [];
    }
  }

  async getMaritimeDocumentById(id: number): Promise<MaritimeDocument | undefined> {
    try {
      const [document] = await db.select().from(maritimeDocuments).where(eq(maritimeDocuments.id, id));
      return document;
    } catch (error) {
      console.error('Error fetching maritime document by ID:', error);
      return undefined;
    }
  }

  async createMaritimeDocument(document: InsertMaritimeDocument): Promise<MaritimeDocument> {
    try {
      const [newDocument] = await db.insert(maritimeDocuments).values(document).returning();
      return newDocument;
    } catch (error) {
      console.error('Error creating maritime document:', error);
      throw new Error('Failed to create maritime document');
    }
  }

  async updateMaritimeDocument(id: number, updates: Partial<InsertMaritimeDocument>): Promise<MaritimeDocument | undefined> {
    try {
      const [updatedDocument] = await db.update(maritimeDocuments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(maritimeDocuments.id, id))
        .returning();
      return updatedDocument;
    } catch (error) {
      console.error('Error updating maritime document:', error);
      throw new Error('Failed to update maritime document');
    }
  }

  async deleteMaritimeDocument(id: number): Promise<boolean> {
    try {
      const result = await db.delete(maritimeDocuments).where(eq(maritimeDocuments.id, id));
      return result.rowCount !== undefined && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting maritime document:', error);
      return false;
    }
  }

  // Document Management Methods (for admin document management with vessel association)
  async getDocuments(): Promise<AdminDocument[]> {
    try {
      const allDocuments = await db.select().from(adminDocuments).orderBy(desc(adminDocuments.createdAt));
      return allDocuments;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  async getDocumentById(id: number): Promise<AdminDocument | undefined> {
    try {
      const [document] = await db.select().from(adminDocuments).where(eq(adminDocuments.id, id));
      return document;
    } catch (error) {
      console.error('Error fetching document by ID:', error);
      throw new Error('Failed to fetch document');
    }
  }

  async createDocument(document: InsertAdminDocument): Promise<AdminDocument> {
    try {
      const [newDocument] = await db.insert(adminDocuments).values(document).returning();
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  }

  async updateDocument(id: number, updates: Partial<InsertAdminDocument>): Promise<AdminDocument | undefined> {
    try {
      const [updatedDocument] = await db.update(adminDocuments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(adminDocuments.id, id))
        .returning();
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  }

  async deleteDocument(id: number): Promise<boolean> {
    try {
      const result = await db.delete(adminDocuments).where(eq(adminDocuments.id, id));
      return result.rowCount !== undefined && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  async getDocumentsByVesselId(vesselId: number): Promise<AdminDocument[]> {
    try {
      const vesselDocuments = await db.select()
        .from(adminDocuments)
        .where(eq(adminDocuments.vesselId, vesselId))
        .orderBy(desc(adminDocuments.createdAt));
      return vesselDocuments;
    } catch (error) {
      console.error('Error fetching documents by vessel ID:', error);
      throw new Error('Failed to fetch vessel documents');
    }
  }

  // Document Template Management Methods
  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    try {
      const templates = await db.select().from(documentTemplates)
        .where(eq(documentTemplates.isActive, true))
        .orderBy(desc(documentTemplates.createdAt));
      return templates;
    } catch (error) {
      console.error('Error fetching document templates:', error);
      throw new Error('Failed to fetch document templates');
    }
  }

  async getDocumentTemplateById(id: number): Promise<DocumentTemplate | undefined> {
    try {
      const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
      return template;
    } catch (error) {
      console.error('Error fetching document template by ID:', error);
      throw new Error('Failed to fetch document template');
    }
  }

  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    try {
      const [newTemplate] = await db.insert(documentTemplates).values(template).returning();
      return newTemplate;
    } catch (error) {
      console.error('Error creating document template:', error);
      throw new Error('Failed to create document template');
    }
  }

  async updateDocumentTemplate(id: number, template: Partial<InsertDocumentTemplate>): Promise<DocumentTemplate> {
    try {
      const [updatedTemplate] = await db
        .update(documentTemplates)
        .set({ ...template, updatedAt: new Date() })
        .where(eq(documentTemplates.id, id))
        .returning();
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating document template:', error);
      throw new Error('Failed to update document template');
    }
  }

  async deleteDocumentTemplate(id: number): Promise<boolean> {
    try {
      await db
        .update(documentTemplates)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(documentTemplates.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting document template:', error);
      throw new Error('Failed to delete document template');
    }
  }

  // Generated Document Management Methods
  async getGeneratedDocuments(vesselId?: number): Promise<GeneratedDocument[]> {
    try {
      let query = db.select().from(generatedDocuments);
      
      if (vesselId) {
        query = query.where(eq(generatedDocuments.vesselId, vesselId));
      }
      
      const documents = await query.orderBy(desc(generatedDocuments.createdAt));
      return documents;
    } catch (error) {
      console.error('Error fetching generated documents:', error);
      throw new Error('Failed to fetch generated documents');
    }
  }

  async createGeneratedDocument(document: InsertGeneratedDocument): Promise<GeneratedDocument> {
    try {
      const [newDocument] = await db.insert(generatedDocuments).values(document).returning();
      return newDocument;
    } catch (error) {
      console.error('Error creating generated document:', error);
      throw new Error('Failed to create generated document');
    }
  }

  async updateGeneratedDocumentStatus(id: number, status: string): Promise<GeneratedDocument> {
    try {
      const [updatedDocument] = await db
        .update(generatedDocuments)
        .set({ status, updatedAt: new Date() })
        .where(eq(generatedDocuments.id, id))
        .returning();
      return updatedDocument;
    } catch (error) {
      console.error('Error updating generated document status:', error);
      throw new Error('Failed to update generated document status');
    }
  }

  // Article Template Management Methods
  async getArticleTemplates(): Promise<any[]> {
    try {
      // For now, return mock data until database tables are created
      return [
        {
          id: 1,
          title: "Technical Safety Certificate",
          description: "Comprehensive technical specifications and safety compliance documentation",
          category: "technical",
          prompt: "Generate a professional technical safety certificate for the vessel {vesselName}. Include technical specifications, safety equipment, compliance certifications, inspection records, and operational guidelines.",
          isActive: true,
          usageCount: 5,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          title: "Commercial Viability Analysis",
          description: "Detailed commercial analysis and market assessment report",
          category: "commercial",
          prompt: "Generate a comprehensive commercial viability analysis for the vessel {vesselName}. Include market analysis, financial metrics, operational efficiency, risk analysis, and investment recommendations.",
          isActive: true,
          usageCount: 3,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          title: "Vessel Inspection Report",
          description: "Detailed inspection findings and compliance assessment",
          category: "inspection",
          prompt: "Generate a comprehensive vessel inspection report for {vesselName}. Include hull integrity, cargo systems, navigation equipment, safety procedures, environmental compliance, crew facilities, and maintenance status.",
          isActive: true,
          usageCount: 7,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          title: "Cargo Manifest & Loading Plan",
          description: "Complete cargo documentation and stowage planning",
          category: "cargo",
          prompt: "Generate a detailed cargo manifest and loading plan for {vesselName}. Include cargo specifications, stowage arrangements, weight distribution, stability calculations, hazmat documentation, and loading procedures.",
          isActive: true,
          usageCount: 12,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          title: "Environmental Compliance Report",
          description: "Environmental impact assessment and regulatory compliance",
          category: "environmental",
          prompt: "Generate an environmental compliance report for {vesselName}. Include emission monitoring, ballast water management, waste disposal procedures, MARPOL compliance, environmental certifications, and sustainability metrics.",
          isActive: true,
          usageCount: 8,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 6,
          title: "Port State Control Certificate",
          description: "Port state inspection certificate and compliance verification",
          category: "regulatory",
          prompt: "Generate a port state control certificate for {vesselName}. Include inspection findings, regulatory compliance status, deficiency reports, corrective actions, flag state notifications, and detention history.",
          isActive: true,
          usageCount: 6,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 7,
          title: "Charter Party Agreement",
          description: "Commercial charter agreement and terms documentation",
          category: "commercial",
          prompt: "Generate a charter party agreement for {vesselName}. Include charter terms, freight rates, laycan specifications, demurrage clauses, voyage instructions, performance warranties, and commercial conditions.",
          isActive: true,
          usageCount: 15,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 8,
          title: "Bunker Delivery Note (BDN)",
          description: "Fuel delivery documentation and quality certification",
          category: "operations",
          prompt: "Generate a bunker delivery note for {vesselName}. Include fuel specifications, quantity delivered, quality parameters, sulfur content, density measurements, supplier certifications, and fuel analysis reports.",
          isActive: true,
          usageCount: 22,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 9,
          title: "Voyage Performance Analysis",
          description: "Comprehensive voyage efficiency and performance metrics",
          category: "performance",
          prompt: "Generate a voyage performance analysis for {vesselName}. Include speed-consumption curves, weather routing analysis, fuel efficiency metrics, schedule adherence, port performance, and optimization recommendations.",
          isActive: true,
          usageCount: 9,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 10,
          title: "Insurance & P&I Documentation",
          description: "Marine insurance certificates and protection coverage",
          category: "insurance",
          prompt: "Generate insurance and P&I documentation for {vesselName}. Include hull and machinery coverage, cargo insurance, liability protection, crew coverage, war risks, pollution coverage, and claims history.",
          isActive: true,
          usageCount: 4,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 11,
          title: "Crew Certification Matrix",
          description: "Crew qualifications and certification management",
          category: "crew",
          prompt: "Generate a crew certification matrix for {vesselName}. Include STCW certifications, medical certificates, watchkeeping qualifications, specialized training, license renewals, and competency assessments.",
          isActive: true,
          usageCount: 11,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 12,
          title: "Dry Dock Planning Report",
          description: "Maintenance planning and dry dock scheduling documentation",
          category: "maintenance",
          prompt: "Generate a dry dock planning report for {vesselName}. Include maintenance schedules, survey requirements, hull treatment, machinery overhauls, classification society inspections, and cost estimates.",
          isActive: true,
          usageCount: 3,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 13,
          title: "Risk Assessment & HSEQ Manual",
          description: "Health, safety, environment, and quality management documentation",
          category: "safety",
          prompt: "Generate a risk assessment and HSEQ manual for {vesselName}. Include hazard identification, risk mitigation measures, emergency procedures, safety protocols, environmental guidelines, and quality standards.",
          isActive: true,
          usageCount: 7,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 14,
          title: "Market Intelligence Report",
          description: "Maritime market analysis and trade route optimization",
          category: "market",
          prompt: "Generate a market intelligence report for {vesselName}. Include freight rate analysis, trade route opportunities, commodity market trends, competitive positioning, demand forecasting, and strategic recommendations.",
          isActive: true,
          usageCount: 6,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 15,
          title: "Ballast Water Management Plan",
          description: "Ballast water treatment and environmental compliance",
          category: "environmental",
          prompt: "Generate a ballast water management plan for {vesselName}. Include BWM system specifications, treatment procedures, sampling protocols, record keeping, compliance monitoring, and environmental impact assessments.",
          isActive: true,
          usageCount: 5,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    } catch (error) {
      console.error('Error fetching article templates:', error);
      throw new Error('Failed to fetch article templates');
    }
  }

  async getArticleTemplateById(id: number): Promise<any | undefined> {
    try {
      const templates = await this.getArticleTemplates();
      return templates.find(t => t.id === id);
    } catch (error) {
      console.error('Error fetching article template by ID:', error);
      throw new Error('Failed to fetch article template');
    }
  }

  async createArticleTemplate(template: any): Promise<any> {
    try {
      // For now, return mock creation until database tables are created
      const newTemplate = {
        id: Math.floor(Math.random() * 1000) + 100,
        ...template,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return newTemplate;
    } catch (error) {
      console.error('Error creating article template:', error);
      throw new Error('Failed to create article template');
    }
  }

  async updateArticleTemplate(id: number, updates: any): Promise<any | undefined> {
    try {
      // For now, return mock update until database tables are created
      const template = await this.getArticleTemplateById(id);
      if (!template) return undefined;
      
      const updatedTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date()
      };
      return updatedTemplate;
    } catch (error) {
      console.error('Error updating article template:', error);
      throw new Error('Failed to update article template');
    }
  }

  async deleteArticleTemplate(id: number): Promise<boolean> {
    try {
      // For now, return true until database tables are created
      const template = await this.getArticleTemplateById(id);
      return !!template;
    } catch (error) {
      console.error('Error deleting article template:', error);
      throw new Error('Failed to delete article template');
    }
  }

  // Generated Document Methods
  private generatedDocuments: any[] = [];

  async createGeneratedDocument(document: any): Promise<any> {
    try {
      // Store in memory until database tables are created
      const newDocument = {
        ...document,
        id: Date.now()
      };
      this.generatedDocuments.push(newDocument);
      return newDocument;
    } catch (error) {
      console.error('Error creating generated document:', error);
      throw new Error('Failed to create generated document');
    }
  }

  async getGeneratedDocumentsByVessel(vesselId: number): Promise<any[]> {
    try {
      // Filter documents by vessel ID from memory storage
      return this.generatedDocuments.filter(doc => doc.vesselId === vesselId);
    } catch (error) {
      console.error('Error fetching generated documents:', error);
      throw new Error('Failed to fetch generated documents');
    }
  }

  async getAllGeneratedDocuments(): Promise<any[]> {
    try {
      // Return all documents from memory storage
      return this.generatedDocuments;
    } catch (error) {
      console.error('Error fetching all generated documents:', error);
      throw new Error('Failed to fetch all generated documents');
    }
  }

  async getGeneratedArticles(): Promise<any[]> {
    try {
      // For now, return mock data until database tables are created
      return [
        {
          id: 1,
          templateId: 1,
          vesselId: 1,
          vesselName: "Ocean Titan",
          title: "Technical Safety Certificate - Ocean Titan",
          content: "<h1>Technical Safety Certificate</h1><p>This document certifies that the vessel Ocean Titan meets all technical safety requirements...</p>",
          status: "generated",
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          templateTitle: "Technical Safety Certificate"
        },
        {
          id: 2,
          templateId: 2,
          vesselId: 2,
          vesselName: "Maritime Glory",
          title: "Commercial Viability Analysis - Maritime Glory",
          content: "<h1>Commercial Viability Analysis</h1><p>This analysis evaluates the commercial potential of the vessel Maritime Glory...</p>",
          status: "generated",
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          templateTitle: "Commercial Viability Analysis"
        }
      ];
    } catch (error) {
      console.error('Error fetching generated articles:', error);
      throw new Error('Failed to fetch generated articles');
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();