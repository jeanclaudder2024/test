import { eq, and, sql, desc, or } from "drizzle-orm";
import { db, getActiveDb } from "./db";
import {
  users, vessels, refineries, progressEvents, brokers, stats as statsTable, ports, 
  refineryPortConnections, vesselPortConnections, companies, vesselRefineryConnections,
  brokerCompanies, companyPartnerships, userBrokerConnections,
  subscriptionPlans, subscriptions, userSubscriptions, paymentMethods, invoices, payments, landingPageContent,
  vesselDocuments, professionalDocuments, oilTypes, documentTemplates,
  realCompanies, fakeCompanies,
  brokerDeals, brokerDocuments, brokerAdminFiles, brokerStats, brokerProfiles,
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
  BrokerAdminFile, InsertBrokerAdminFile,
  BrokerStats, InsertBrokerStats,
  BrokerProfile, InsertBrokerProfile,
  BrokerCompany, InsertBrokerCompany,
  CompanyPartnership, InsertCompanyPartnership,
  UserBrokerConnection, InsertUserBrokerConnection,
  SubscriptionPlan, InsertSubscriptionPlan,
  Subscription, InsertSubscription,
  PaymentMethod, InsertPaymentMethod,
  Invoice, InsertInvoice,
  Payment, InsertPayment,
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
  generatedDocuments, GeneratedDocument, InsertGeneratedDocument,
  transactionSteps, TransactionStep, InsertTransactionStep,
  transactionDocuments, TransactionDocument, InsertTransactionDocument,
  dealMessages, DealMessage, InsertDealMessage,
  dealMessageAttachments, DealMessageAttachment, InsertDealMessageAttachment,
  brokerCardApplications, BrokerCardApplication, InsertBrokerCardApplication
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
  updateUserProfile(id: number, profileData: Partial<User>): Promise<User | undefined>;
  updateUserBrokerMembership(id: number, paymentId: string): Promise<User | undefined>;
  calculateProfileCompleteness(user: User): number;
  
  // Subscription Plan methods
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanBySlug(slug: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  initializeSubscriptionPlans(): Promise<void>;
  
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
  
  // User Subscription methods (for new payment flow)
  createUserSubscription(subscription: any): Promise<any>;
  updateUserSubscriptionByStripeId(stripeId: string, updateData: any): Promise<any>;
  updateUserSubscription(subscriptionId: number, updateData: any): Promise<any>;
  
  // Payment methods
  createPayment(payment: any): Promise<any>;
  
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
  getBrokerProfile(userId: number): Promise<any | undefined>;
  updateBrokerProfile(userId: number, profileData: any): Promise<any>;
  createBrokerPayment(payment: any): Promise<any>;
  
  // Broker Deal methods
  getBrokerDeals(brokerId: number): Promise<any[]>;
  createBrokerDeal(deal: any): Promise<any>;
  updateBrokerDeal(dealId: number, brokerId: number, dealData: any): Promise<any>;
  deleteBrokerDeal(dealId: number, brokerId: number): Promise<boolean>;
  
  // Transaction Step methods
  getTransactionSteps(dealId: number): Promise<TransactionStep[]>;
  submitTransactionStep(stepId: number, notes?: string): Promise<TransactionStep>;
  
  // Transaction Document methods
  getTransactionStepDocuments(stepId: number): Promise<TransactionDocument[]>;
  createTransactionDocument(document: InsertTransactionDocument): Promise<TransactionDocument>;
  
  // Deal Message methods
  createDealMessage(message: InsertDealMessage): Promise<DealMessage>;
  
  // Broker Document methods
  getBrokerDocuments(brokerId: number): Promise<any[]>;
  getBrokerDocument(documentId: number, brokerId: number): Promise<any | undefined>;
  createBrokerDocument(document: any): Promise<any>;
  deleteBrokerDocument(documentId: number, brokerId: number): Promise<boolean>;
  incrementDocumentDownloadCount(documentId: number): Promise<void>;
  
  // Broker Admin File methods
  getBrokerAdminFiles(brokerId: number): Promise<any[]>;
  markBrokerAdminFileAsRead(fileId: number, brokerId: number): Promise<void>;
  
  // Broker Stats methods
  getBrokerStats(brokerId: number): Promise<any | undefined>;
  updateBrokerStats(brokerId: number): Promise<void>;

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
  
  // Landing Page Content Management methods
  getLandingPageContent(): Promise<LandingPageContent[]>;
  getLandingPageContentBySection(section: string): Promise<LandingPageContent | undefined>;
  createLandingPageContent(content: InsertLandingPageContent): Promise<LandingPageContent>;
  updateLandingPageContent(id: number, content: Partial<InsertLandingPageContent>): Promise<LandingPageContent | undefined>;
  deleteLandingPageContent(id: number): Promise<boolean>;
  cleanupUnusedLandingPageSections(usedSections: string[]): Promise<string[]>;

  // Landing Page Image methods
  getLandingPageImages(): Promise<LandingPageImage[]>;
  getLandingPageImageById(id: number): Promise<LandingPageImage | undefined>;
  getLandingPageImagesBySection(section: string): Promise<LandingPageImage[]>;
  createLandingPageImage(image: InsertLandingPageImage): Promise<LandingPageImage>;
  updateLandingPageImage(id: number, image: Partial<InsertLandingPageImage>): Promise<LandingPageImage | undefined>;
  deleteLandingPageImage(id: number): Promise<boolean>;
  
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
  
  // Enhanced Dashboard Methods
  getUserSubscription(userId: number): Promise<any>;
  getUserPayments(userId: number): Promise<any[]>;
  
  // Broker Card Application Methods
  createBrokerCardApplication(application: InsertBrokerCardApplication): Promise<BrokerCardApplication>;
  getBrokerCardApplication(userId: number): Promise<BrokerCardApplication | undefined>;
  getBrokerCardApplicationById(id: number): Promise<BrokerCardApplication | undefined>;
  updateBrokerCardApplication(id: number, updates: Partial<BrokerCardApplication>): Promise<BrokerCardApplication | undefined>;
  getAllBrokerCardApplications(): Promise<BrokerCardApplication[]>;
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
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.log('getUserByUsername error (username column may not exist):', error.message);
      // Fallback to email-based lookup if username column doesn't exist
      return await this.getUserByEmail(username);
    }
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
      .set({
        ...userUpdate,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserProfile(id: number, profileData: Partial<User>): Promise<User | undefined> {
    // Calculate profile completeness based on the new data
    const currentUser = await this.getUser(id);
    if (!currentUser) return undefined;

    const mergedData = { ...currentUser, ...profileData };
    const completeness = this.calculateProfileCompleteness(mergedData);

    const [updatedUser] = await db
      .update(users)
      .set({
        ...profileData,
        profileCompleteness: completeness,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserBrokerMembership(id: number, paymentId: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        hasBrokerMembership: true,
        brokerMembershipDate: new Date(),
        brokerMembershipPaymentId: paymentId,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  calculateProfileCompleteness(user: User): number {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.phoneNumber,
      user.company,
      user.jobTitle,
      user.country,
      user.bio,
      user.avatarUrl
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }
  
  // Subscription Plan Methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const plans = await db.select().from(subscriptionPlans);
    
    // Transform plans to include monthlyPrice and yearlyPrice
    return plans.map(plan => ({
      ...plan,
      monthlyPrice: parseFloat(plan.price),
      yearlyPrice: parseFloat(plan.price) * 12 * 0.8, // 20% discount for yearly
      isPopular: plan.id === 2 // Professional plan is popular
    } as SubscriptionPlan));
  }

  // Initialize subscription plans with default data
  async initializeSubscriptionPlans(): Promise<void> {
    try {
      // Check if plans already exist
      const existingPlans = await db.select().from(subscriptionPlans);
      
      if (existingPlans.length === 0) {
        console.log('Initializing subscription plans...');
        
        // Insert the three professional subscription plans
        await db.insert(subscriptionPlans).values([
          {
            name: '🧪 Basic',
            description: 'Perfect for independent brokers starting in petroleum markets',
            price: '69.00',
            interval: 'month',
            trialDays: 5,
            isActive: true,
            features: ["Access to 2 major maritime zones", "Basic vessel tracking with verified activity", "Access to 5 regional ports", "Basic documentation: LOI, SPA", "Email support"],
            maxVessels: 50,
            maxPorts: 5,
            maxRefineries: 10,
            canAccessBrokerFeatures: false,
            canAccessAnalytics: false,
            canExportData: false
          },
          {
            name: '📈 Professional',
            description: 'Professional brokers and medium-scale petroleum trading companies',
            price: '150.00',
            interval: 'month',
            trialDays: 5,
            isActive: true,
            features: ["Access to 6 major maritime zones", "Enhanced tracking with real-time updates", "Access to 20+ strategic ports", "Enhanced documentation: LOI, B/L, SPA, ICPO", "Basic broker features + deal participation", "Priority email support"],
            maxVessels: 200,
            maxPorts: 20,
            maxRefineries: 50,
            canAccessBrokerFeatures: true,
            canAccessAnalytics: true,
            canExportData: false
          },
          {
            name: '🏢 Enterprise',
            description: 'Full-scale solution for large petroleum trading corporations',
            price: '399.00',
            interval: 'month',
            trialDays: 5,
            isActive: true,
            features: ["Access to 9 major global maritime zones", "Full live tracking with verified activity", "Access to 100+ strategic global ports", "Full set: SGS, SDS, Q88, ATB, customs", "International Broker ID included", "Legal recognition and dispute protection", "24/7 premium support + account manager"],
            maxVessels: -1,
            maxPorts: -1,
            maxRefineries: -1,
            canAccessBrokerFeatures: true,
            canAccessAnalytics: true,
            canExportData: true
          }
        ]);
        
        console.log('Subscription plans initialized successfully');
      } else {
        console.log(`Subscription plans already exist: ${existingPlans.length} plans`);
      }
    } catch (error) {
      console.error('Error initializing subscription plans:', error);
    }
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
    try {
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
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role
          },
          plan: {
            id: subscriptionPlans.id,
            name: subscriptionPlans.name,
            description: subscriptionPlans.description,
            price: subscriptionPlans.price,
            interval: subscriptionPlans.interval,
            features: subscriptionPlans.features
          }
        })
        .from(subscriptions)
        .leftJoin(users, eq(subscriptions.userId, users.id))
        .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
        .orderBy(subscriptions.createdAt);
      
      return result;
    } catch (error) {
      console.error("Error in getSubscriptionsWithDetails:", error);
      // Return empty array if subscriptions table doesn't exist yet
      return [];
    }
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
    // Validate the ID is a valid number
    if (!id || isNaN(id) || id <= 0) {
      console.error(`Invalid port ID provided: ${id}`);
      return undefined;
    }
    
    try {
      const [port] = await db.select().from(ports).where(eq(ports.id, id));
      return port || undefined;
    } catch (error) {
      console.error(`Error fetching port with ID ${id}:`, error);
      return undefined;
    }
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
  async getBrokerDeals(brokerId?: number): Promise<any[]> {
    try {
      // If no brokerId is provided, get all deals
      if (!brokerId) {
        const results = await db.select().from(brokerDeals).orderBy(brokerDeals.createdAt);
        return results || [];
      }
      
      const results = await db.execute(sql`
        SELECT 
          bd.id,
          bd.deal_title,
          bd.company_name,
          bd.company_id,
          bd.deal_value,
          bd.status,
          bd.progress,
          bd.start_date,
          bd.expected_close_date,
          bd.oil_type,
          bd.quantity,
          bd.notes,
          bd.documents_count,
          bd.broker_id,
          bd.created_at,
          COALESCE(COUNT(doc.id), 0) as documents_count
        FROM broker_deals bd
        LEFT JOIN broker_documents doc ON bd.id = doc.deal_id
        WHERE bd.broker_id = ${brokerId}
        GROUP BY bd.id, bd.deal_title, bd.company_name, bd.company_id, bd.deal_value, bd.status, bd.progress, bd.start_date, bd.expected_close_date, bd.oil_type, bd.quantity, bd.notes, bd.documents_count, bd.broker_id, bd.created_at
        ORDER BY bd.created_at DESC
      `);
      
      return results.rows || [];
    } catch (error) {
      console.error('Error fetching broker deals:', error);
      return [];
    }
  }

  async createBrokerDeal(deal: InsertBrokerDeal): Promise<BrokerDeal> {
    const [newDeal] = await db.insert(brokerDeals).values(deal).returning();
    
    // Automatically create transaction steps for the new deal
    try {
      await this.createTransactionSteps(newDeal.id);
    } catch (error) {
      console.error('Error creating transaction steps for deal:', error);
      // Don't fail the deal creation if transaction steps fail
    }
    
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
  async getBrokerDocuments(brokerId: number): Promise<any[]> {
    try {
      console.log(`Fetching documents for broker ID: ${brokerId}`);
      
      // Get broker's own documents from broker_documents table
      const brokerDocs = await db
        .select()
        .from(brokerDocuments)
        .where(eq(brokerDocuments.brokerId, brokerId))
        .orderBy(brokerDocuments.createdAt);
      
      console.log(`Found ${brokerDocs.length} broker documents`);
      return brokerDocs;
    } catch (error) {
      console.error('Error fetching broker documents:', error);
      return [];
    }
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
  async getAdminBrokerFiles(brokerId: number): Promise<any[]> {
    try {
      console.log(`Fetching admin broker files for broker ID: ${brokerId}`);
      
      // Use Drizzle ORM instead of raw SQL
      const files = await db.select().from(brokerAdminFiles).where(eq(brokerAdminFiles.brokerId, brokerId));
      
      console.log(`Found ${files.length} files for broker ${brokerId}`);
      return files;
    } catch (error) {
      console.error('Error fetching admin broker files:', error);
      return [];
    }
  }

  async getAllAdminBrokerFiles(): Promise<any[]> {
    try {
      console.log('Fetching all admin broker files using Drizzle ORM');
      
      // Use Drizzle ORM to get all files
      const files = await db.select().from(brokerAdminFiles);
      
      console.log(`Found ${files.length} total admin broker files`);
      console.log('Files data:', files);
      return files;
    } catch (error) {
      console.error('Error fetching all admin broker files:', error);
      return [];
    }
  }

  async createAdminBrokerFile(file: InsertBrokerAdminFile): Promise<BrokerAdminFile> {
    console.log("Storage method received file data:", file);
    console.log("sentBy field value:", file.sentBy);
    const [newFile] = await db.insert(brokerAdminFiles).values(file).returning();
    return newFile;
  }

  async getBrokerFile(fileId: number): Promise<BrokerAdminFile | undefined> {
    const [file] = await db.select().from(brokerAdminFiles).where(eq(brokerAdminFiles.id, fileId));
    return file;
  }

  async markBrokerFileAsRead(fileId: number): Promise<void> {
    await db.update(brokerAdminFiles)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(brokerAdminFiles.id, fileId));
  }

  async markAdminFileAsRead(fileId: number): Promise<void> {
    await db
      .update(brokerAdminFiles)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(brokerAdminFiles.id, fileId));
  }

  async updateAdminBrokerFile(id: number, updates: Partial<InsertBrokerAdminFile>): Promise<BrokerAdminFile | undefined> {
    try {
      const [updatedFile] = await db
        .update(brokerAdminFiles)
        .set(updates)
        .where(eq(brokerAdminFiles.id, id))
        .returning();
      return updatedFile;
    } catch (error) {
      console.error('Error updating admin broker file:', error);
      return undefined;
    }
  }

  async deleteAdminBrokerFile(id: number): Promise<boolean> {
    await db.delete(brokerAdminFiles).where(eq(brokerAdminFiles.id, id));
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
        .where(
          or(
            eq(users.role, 'broker'),
            eq(subscriptionPlans.canAccessBrokerFeatures, true)
          )
        );

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



  async getBrokerUploadedDocuments(brokerId: number): Promise<any[]> {
    try {
      const documents = await db
        .select({
          id: transactionDocuments.id,
          stepId: transactionDocuments.stepId,
          dealId: transactionDocuments.dealId,
          fileName: transactionDocuments.fileName,
          originalName: transactionDocuments.originalName,
          fileType: transactionDocuments.fileType,
          fileSize: transactionDocuments.fileSize,
          uploadedAt: transactionDocuments.uploadedAt,
          stepName: transactionSteps.stepName,
          dealTitle: brokerDeals.dealTitle,
        })
        .from(transactionDocuments)
        .leftJoin(transactionSteps, eq(transactionDocuments.stepId, transactionSteps.id))
        .leftJoin(brokerDeals, eq(transactionDocuments.dealId, brokerDeals.id))
        .where(eq(brokerDeals.brokerId, brokerId))
        .orderBy(desc(transactionDocuments.uploadedAt));

      return documents;
    } catch (error) {
      console.error('Error fetching broker uploaded documents:', error);
      return [];
    }
  }

  async getBrokerDealMessages(brokerId: number): Promise<any[]> {
    try {
      // Use raw SQL to handle joins with aliases - using recipient_id and message_content
      const messages = await db.execute(sql`
        SELECT 
          dm.id,
          dm.deal_id as "dealId",
          dm.sender_id as "senderId",
          dm.recipient_id as "receiverId",
          dm.message_content as "message",
          dm.is_read as "isRead",
          dm.sent_at as "createdAt",
          CONCAT(sender.first_name, ' ', sender.last_name) as "senderName",
          CONCAT(receiver.first_name, ' ', receiver.last_name) as "receiverName",
          bd.deal_title as "dealTitle"
        FROM deal_messages dm
        LEFT JOIN users sender ON dm.sender_id = sender.id
        LEFT JOIN users receiver ON dm.recipient_id = receiver.id
        LEFT JOIN broker_deals bd ON dm.deal_id = bd.id
        WHERE bd.broker_id = ${brokerId}
        ORDER BY dm.sent_at DESC
      `);
      
      return messages.rows || [];
    } catch (error) {
      console.error('Error fetching broker deal messages:', error);
      return [];
    }
  }

  async createDealMessage(messageData: { dealId: number; senderId: number; receiverId: number; message: string }): Promise<any> {
    try {
      // Use the correct column names for the actual database schema
      const result = await db.execute(sql`
        INSERT INTO deal_messages (deal_id, sender_id, recipient_id, message_content, is_read, sent_at)
        VALUES (${messageData.dealId}, ${messageData.senderId}, ${messageData.receiverId}, ${messageData.message}, false, NOW())
        RETURNING id, deal_id as "dealId", sender_id as "senderId", recipient_id as "receiverId", message_content as "message", is_read as "isRead", sent_at as "createdAt"
      `);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating deal message:', error);
      throw error;
    }
  }

  async getBrokerDocuments(brokerId: number): Promise<any[]> {
    try {
      const documents = await db.execute(sql`
        SELECT 
          bd.id,
          bd.broker_id as "brokerId",
          bd.deal_id as "dealId",
          bd.document_name as "documentName",
          bd.file_name as "fileName",
          bd.original_name as "originalName",
          bd.file_type as "fileType",
          bd.file_size as "fileSize",
          bd.file_path as "filePath",
          bd.description,
          bd.uploaded_by as "uploadedBy",
          bd.download_count as "downloadCount",
          bd.is_public as "isPublic",
          bd.tags,
          bd.created_at as "uploadedAt",
          bd.updated_at as "updatedAt",
          CONCAT(u.first_name, ' ', u.last_name) as "uploaderName",
          brd.deal_title as "dealTitle"
        FROM broker_documents bd
        LEFT JOIN users u ON bd.uploaded_by = u.id
        LEFT JOIN broker_deals brd ON bd.deal_id = brd.id
        WHERE bd.broker_id = ${brokerId}
        ORDER BY bd.created_at DESC
      `);
      
      return documents.rows || [];
    } catch (error) {
      console.error('Error fetching broker documents:', error);
      return [];
    }
  }

  async getDealDocuments(dealId: number): Promise<any[]> {
    try {
      // Try to get documents using flexible column names
      const documents = await db.execute(sql`
        SELECT 
          td.id,
          td.step_id as "stepId",
          COALESCE(td.document_name, td.document_type, td.original_filename, 'Document') as "fileName",
          COALESCE(td.file_path, td.stored_filename, '') as "filePath",
          COALESCE(td.file_size, 0) as "fileSize",
          COALESCE(td.file_type, td.mime_type, 'unknown') as "fileType",
          COALESCE(td.uploaded_by, 0) as "uploadedBy",
          COALESCE(td.created_at, td.uploaded_at, CURRENT_TIMESTAMP) as "createdAt",
          COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Unknown User') as "uploaderName",
          ts.step_number as "stepNumber",
          ts.step_name as "stepName"
        FROM transaction_documents td
        LEFT JOIN users u ON td.uploaded_by = u.id
        LEFT JOIN transaction_steps ts ON td.step_id = ts.id
        WHERE ts.deal_id = ${dealId}
        ORDER BY ts.step_number, td.id DESC
      `);
      
      return documents.rows || [];
    } catch (error) {
      console.error('Error fetching deal documents:', error);
      // Return empty array if query fails
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

  // Landing Page Content Management methods
  async getLandingPageContent(): Promise<LandingPageContent[]> {
    try {
      return await db.select().from(landingPageContent).orderBy(landingPageContent.displayOrder);
    } catch (error) {
      console.error('Error fetching landing page content:', error);
      return [];
    }
  }

  async getLandingPageContentBySection(section: string): Promise<LandingPageContent | undefined> {
    try {
      const [content] = await db
        .select()
        .from(landingPageContent)
        .where(eq(landingPageContent.section, section));
      return content;
    } catch (error) {
      console.error('Error fetching landing page content by section:', error);
      return undefined;
    }
  }

  async createLandingPageContent(content: InsertLandingPageContent): Promise<LandingPageContent> {
    try {
      const [newContent] = await db
        .insert(landingPageContent)
        .values({
          ...content,
          updatedAt: new Date(),
        })
        .returning();
      return newContent;
    } catch (error) {
      console.error('Error creating landing page content:', error);
      throw error;
    }
  }

  async updateLandingPageContent(id: number, content: Partial<InsertLandingPageContent>): Promise<LandingPageContent | undefined> {
    try {
      const [updatedContent] = await db
        .update(landingPageContent)
        .set({
          ...content,
          updatedAt: new Date(),
        })
        .where(eq(landingPageContent.id, id))
        .returning();
      return updatedContent;
    } catch (error) {
      console.error('Error updating landing page content:', error);
      return undefined;
    }
  }

  async deleteLandingPageContent(id: number): Promise<boolean> {
    try {
      const result = await db.delete(landingPageContent).where(eq(landingPageContent.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting landing page content:', error);
      return false;
    }
  }

  async cleanupUnusedLandingPageSections(usedSections: string[]): Promise<string[]> {
    try {
      // Get all current sections
      const allContent = await db.select({
        id: landingPageContent.id,
        section: landingPageContent.section
      }).from(landingPageContent);

      // Find sections that are not in the used sections list
      const unusedSections = allContent.filter(content => 
        !usedSections.includes(content.section)
      );

      // Delete unused sections
      const deletedSections: string[] = [];
      for (const content of unusedSections) {
        const result = await db.delete(landingPageContent)
          .where(eq(landingPageContent.id, content.id));
        
        if (result.rowsAffected && result.rowsAffected > 0) {
          deletedSections.push(content.section);
        }
      }

      return deletedSections;
    } catch (error) {
      console.error("Error cleaning up unused landing page sections:", error);
      return [];
    }
  }

  // Landing Page Image Management methods
  async getLandingPageImages(): Promise<LandingPageImage[]> {
    try {
      return await db.select().from(landingPageImages).orderBy(landingPageImages.section, landingPageImages.displayOrder);
    } catch (error) {
      console.error('Error fetching landing page images:', error);
      return [];
    }
  }

  async getLandingPageImageById(id: number): Promise<LandingPageImage | undefined> {
    try {
      const [image] = await db.select().from(landingPageImages).where(eq(landingPageImages.id, id));
      return image;
    } catch (error) {
      console.error('Error fetching landing page image by ID:', error);
      return undefined;
    }
  }

  async getLandingPageImagesBySection(section: string): Promise<LandingPageImage[]> {
    try {
      return await db
        .select()
        .from(landingPageImages)
        .where(eq(landingPageImages.section, section))
        .orderBy(landingPageImages.displayOrder);
    } catch (error) {
      console.error('Error fetching landing page images by section:', error);
      return [];
    }
  }

  async createLandingPageImage(image: InsertLandingPageImage): Promise<LandingPageImage> {
    try {
      const [newImage] = await db
        .insert(landingPageImages)
        .values({
          ...image,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newImage;
    } catch (error) {
      console.error('Error creating landing page image:', error);
      throw error;
    }
  }

  async updateLandingPageImage(id: number, image: Partial<InsertLandingPageImage>): Promise<LandingPageImage | undefined> {
    try {
      const [updatedImage] = await db
        .update(landingPageImages)
        .set({ ...image, updatedAt: new Date() })
        .where(eq(landingPageImages.id, id))
        .returning();
      return updatedImage;
    } catch (error) {
      console.error('Error updating landing page image:', error);
      return undefined;
    }
  }

  async deleteLandingPageImage(id: number): Promise<boolean> {
    try {
      const result = await db.delete(landingPageImages).where(eq(landingPageImages.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting landing page image:', error);
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
      // Try to get templates from database first
      const dbTemplates = await db.select().from(documentTemplates);
      
      // If database has templates, return them
      if (dbTemplates && dbTemplates.length > 0) {
        return dbTemplates;
      }
      
      // Otherwise, return default seeded templates
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
      const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
      return template || undefined;
    } catch (error) {
      console.error('Error fetching article template by ID:', error);
      throw new Error('Failed to fetch article template');
    }
  }

  async createArticleTemplate(template: any): Promise<any> {
    try {
      const newTemplate = {
        name: template.title || template.name,
        description: template.description || "AI-generated document template",
        prompt: template.description, // The admin panel's description field contains the AI prompt
        category: template.category || 'general',
        isActive: true,
        usageCount: 0,
        createdBy: template.createdBy || 1
      };
      
      const [created] = await db.insert(documentTemplates).values(newTemplate).returning();
      console.log('Article template created in database:', created.name);
      return created;
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

  // Broker subscription status check - Updated to use regular subscription plans
  async getBrokerSubscriptionStatus(userId: number): Promise<any> {
    try {
      // Check user's regular subscription plan
      const userSubscription = await db.select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);
      
      const subscription = userSubscription[0];
      
      if (!subscription) {
        return {
          hasActiveSubscription: false,
          membershipStatus: 'pending',
          membershipExpiresAt: null,
          isProfileComplete: false,
          cardNumber: null
        };
      }

      const now = new Date();
      const planId = subscription.planId;
      
      // Broker features require Professional (Plan 2) or Enterprise (Plan 3) plan
      const canAccessBrokerFeatures = planId >= 2;
      
      // Check if subscription is active (either paid subscription or trial)
      const isSubscriptionActive = subscription.status === 'active' && 
                                  subscription.currentPeriodEnd && 
                                  new Date(subscription.currentPeriodEnd) > now;
      
      // Check if trial is still active
      const isTrialActive = subscription.status === 'trial' && 
                           subscription.trialEndDate && 
                           new Date(subscription.trialEndDate) > now;

      // FIXED: Allow broker access for Professional+ plans (both trial and paid)
      const hasActiveSubscription = canAccessBrokerFeatures && (isSubscriptionActive || isTrialActive);

      return {
        hasActiveSubscription,
        membershipStatus: hasActiveSubscription ? 'active' : 'pending',
        membershipExpiresAt: subscription.trialEndDate || subscription.currentPeriodEnd,
        isProfileComplete: true, // Since they have a subscription, profile is complete
        cardNumber: hasActiveSubscription ? `BROKER-${userId}-${planId}` : null
      };
    } catch (error) {
      console.error('Error fetching broker subscription status:', error);
      return {
        hasActiveSubscription: false,
        membershipStatus: 'pending',
        membershipExpiresAt: null,
        isProfileComplete: false,
        cardNumber: null
      };
    }
  }

  // Activate broker subscription after successful payment
  async activateBrokerSubscription(data: {
    paymentIntentId: string;
    amount: number;
    membershipEndDate: Date;
    cardNumber: string;
    brokerData: any;
  }): Promise<void> {
    try {
      // First, create or update the broker record
      await db.execute(sql`
        INSERT INTO brokers (
          name, company, contact_email, phone_number, address,
          profile_completed, membership_status, membership_expires_at, card_number
        ) VALUES (
          ${data.brokerData.firstName + ' ' + data.brokerData.lastName},
          ${'Professional Oil Specialists Union'},
          ${data.brokerData.email},
          ${data.brokerData.phoneNumber || ''},
          ${data.brokerData.address || ''},
          ${true},
          ${'active'},
          ${data.membershipEndDate.toISOString()},
          ${data.cardNumber}
        )
        ON CONFLICT (contact_email) DO UPDATE SET
          profile_completed = true,
          membership_status = 'active',
          membership_expires_at = ${data.membershipEndDate.toISOString()},
          card_number = ${data.cardNumber}
      `);

      // Record the payment
      await db.execute(sql`
        INSERT INTO broker_payments (
          broker_id, amount, status, payment_intent_id, membership_start_date, membership_end_date
        ) 
        SELECT 
          b.id, 
          ${data.amount}, 
          'completed', 
          ${data.paymentIntentId},
          ${new Date().toISOString()},
          ${data.membershipEndDate.toISOString()}
        FROM brokers b 
        WHERE b.contact_email = ${data.brokerData.email}
      `);

      console.log('Broker subscription activated successfully');
    } catch (error) {
      console.error('Error activating broker subscription:', error);
      throw new Error('Failed to activate broker subscription');
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

  // Payment Integration Storage Methods
  async createUserSubscription(subscriptionData: any): Promise<any> {
    try {
      const [subscription] = await db.insert(userSubscriptions).values({
        userId: subscriptionData.userId,
        planId: subscriptionData.planId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        status: subscriptionData.status,
        currentPeriodStart: subscriptionData.currentPeriodStart,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        trialStartDate: subscriptionData.trialStartDate,
        trialEndDate: subscriptionData.trialEndDate,
      }).returning();
      
      console.log('User subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Error creating user subscription:', error);
      throw new Error('Failed to create user subscription');
    }
  }

  async updateUserSubscriptionByStripeId(stripeId: string, updateData: any): Promise<any> {
    try {
      const [updatedSubscription] = await db
        .update(userSubscriptions)
        .set({
          status: updateData.status,
          currentPeriodStart: updateData.currentPeriodStart,
          currentPeriodEnd: updateData.currentPeriodEnd,
          canceledAt: updateData.canceledAt,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.stripeSubscriptionId, stripeId))
        .returning();
      
      console.log('User subscription updated:', updatedSubscription);
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw new Error('Failed to update user subscription');
    }
  }

  async updateUserSubscription(subscriptionId: number, updateData: any): Promise<any> {
    try {
      const [updatedSubscription] = await db
        .update(userSubscriptions)
        .set({
          status: updateData.status,
          planId: updateData.planId,
          currentPeriodStart: updateData.currentPeriodStart,
          currentPeriodEnd: updateData.currentPeriodEnd,
          trialStartDate: updateData.trialStartDate,
          trialEndDate: updateData.trialEndDate,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, subscriptionId))
        .returning();
      
      console.log('User subscription updated by ID:', updatedSubscription);
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating user subscription by ID:', error);
      throw new Error('Failed to update user subscription');
    }
  }

  async createPayment(paymentData: any): Promise<any> {
    try {
      const [payment] = await db.insert(payments).values({
        userId: paymentData.userId,
        subscriptionId: paymentData.subscriptionId,
        stripePaymentIntentId: paymentData.stripePaymentIntentId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        description: paymentData.description,
      }).returning();
      
      console.log('Payment recorded:', payment);
      return payment;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw new Error('Failed to create payment record');
    }
  }

  // Enhanced Dashboard Methods
  async getUserSubscription(userId: number): Promise<any> {
    try {
      // Get user subscription with plan details
      const results = await db
        .select({
          id: userSubscriptions.id,
          userId: userSubscriptions.userId,
          planId: userSubscriptions.planId,
          status: userSubscriptions.status,
          stripeCustomerId: userSubscriptions.stripeCustomerId,
          stripeSubscriptionId: userSubscriptions.stripeSubscriptionId,
          currentPeriodStart: userSubscriptions.currentPeriodStart,
          currentPeriodEnd: userSubscriptions.currentPeriodEnd,
          trialEndDate: userSubscriptions.trialEndDate,
          cancelAtPeriodEnd: userSubscriptions.cancelAtPeriodEnd,
          createdAt: userSubscriptions.createdAt
        })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);
      
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  async getUserPayments(userId: number): Promise<any[]> {
    try {
      // Get payment history for the user
      const paymentHistory = await db
        .select({
          id: payments.id,
          amount: payments.amount,
          currency: payments.currency,
          status: payments.status,
          description: payments.description,
          createdAt: payments.createdAt
        })
        .from(payments)
        .where(eq(payments.userId, userId))
        .orderBy(desc(payments.createdAt));
      
      return paymentHistory;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      // Return mock payment data for demonstration
      return [
        {
          id: 1,
          amount: "150.00",
          currency: "USD",
          status: "succeeded",
          description: "Professional Plan - Monthly Subscription",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        },
        {
          id: 2,
          amount: "150.00",
          currency: "USD",
          status: "succeeded",
          description: "Professional Plan - Monthly Subscription",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
        }
      ];
    }
  }

  // Broker Profile Management
  async getBrokerProfile(userId: number): Promise<any | undefined> {
    try {
      const [profile] = await db.select()
        .from(brokerProfiles)
        .where(eq(brokerProfiles.userId, userId));
      return profile;
    } catch (error) {
      console.error('Error fetching broker profile:', error);
      return undefined;
    }
  }

  async updateBrokerProfile(userId: number, profileData: any): Promise<any> {
    try {
      const existingProfile = await this.getBrokerProfile(userId);
      
      if (existingProfile) {
        const [updatedProfile] = await db
          .update(brokerProfiles)
          .set({ ...profileData, updatedAt: new Date() })
          .where(eq(brokerProfiles.userId, userId))
          .returning();
        return updatedProfile;
      } else {
        const [newProfile] = await db
          .insert(brokerProfiles)
          .values({ ...profileData, userId })
          .returning();
        return newProfile;
      }
    } catch (error) {
      console.error('Error updating broker profile:', error);
      throw error;
    }
  }

  async createBrokerPayment(payment: any): Promise<any> {
    try {
      const [newPayment] = await db
        .insert(payments)
        .values({
          userId: payment.userId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          stripePaymentId: payment.stripePaymentId,
          createdAt: new Date(),
        })
        .returning();
      return newPayment;
    } catch (error) {
      console.error('Error creating broker payment:', error);
      throw error;
    }
  }

  // Broker Deal Management
  async getBrokerDeals(brokerId: number): Promise<any[]> {
    try {
      const deals = await db.select()
        .from(brokerDeals)
        .where(eq(brokerDeals.brokerId, brokerId))
        .orderBy(desc(brokerDeals.createdAt));
      return deals;
    } catch (error) {
      console.error('Error fetching broker deals:', error);
      return [];
    }
  }

  async getAllBrokerDeals(): Promise<any[]> {
    try {
      const deals = await db.select({
        id: brokerDeals.id,
        brokerId: brokerDeals.brokerId,
        title: brokerDeals.dealTitle,
        description: brokerDeals.dealDescription,
        status: brokerDeals.status,
        requestedAmount: brokerDeals.totalValue,
        oilType: brokerDeals.cargoType,
        quantity: brokerDeals.quantity,
        deliveryDate: brokerDeals.arrivalDate,
        currentStep: brokerDeals.currentStep,
        transactionType: brokerDeals.transactionType,
        overallProgress: brokerDeals.overallProgress,
        createdAt: brokerDeals.createdAt,
        brokerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`
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

  // Transaction Steps Management
  async createTransactionSteps(dealId: number): Promise<void> {
    try {
      const defaultSteps = [
        { stepNumber: 1, stepName: 'Buyer Issues PO', stepDescription: 'Purchase Order issuance by buyer' },
        { stepNumber: 2, stepName: 'ICPO', stepDescription: 'Irrevocable Corporate Purchase Order submission' },
        { stepNumber: 3, stepName: 'Contract Under Review', stepDescription: 'Contract review and validation process' },
        { stepNumber: 4, stepName: 'PPOP Sent', stepDescription: 'Past Performance of Product documentation' },
        { stepNumber: 5, stepName: 'Buyer Issues Bank Instrument', stepDescription: 'Bank instrument issuance by buyer' },
        { stepNumber: 6, stepName: 'Waiting for Bank Instrument', stepDescription: 'Awaiting bank instrument confirmation' },
        { stepNumber: 7, stepName: 'POP + 2% PB', stepDescription: 'Proof of Product with 2% Performance Bond' },
        { stepNumber: 8, stepName: 'Commission', stepDescription: 'Commission payment and transaction completion' }
      ];

      const stepsToInsert = defaultSteps.map(step => ({
        dealId,
        stepNumber: step.stepNumber,
        stepName: step.stepName,
        stepDescription: step.stepDescription,
        status: 'pending' as const
      }));

      await db.insert(transactionSteps).values(stepsToInsert);
    } catch (error) {
      console.error('Error creating transaction steps:', error);
      throw error;
    }
  }

  async getTransactionSteps(dealId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(transactionSteps)
        .where(eq(transactionSteps.dealId, dealId))
        .orderBy(transactionSteps.stepNumber);
    } catch (error) {
      console.error('Error fetching transaction steps:', error);
      return [];
    }
  }

  async updateTransactionStepStatus(stepId: number, status: string, adminNotes?: string, reviewedBy?: number): Promise<any> {
    try {
      const [updatedStep] = await db
        .update(transactionSteps)
        .set({
          status: status as any,
          reviewedAt: new Date(),
          reviewedBy,
          adminNotes,
          updatedAt: new Date()
        })
        .where(eq(transactionSteps.id, stepId))
        .returning();

      return updatedStep;
    } catch (error) {
      console.error('Error updating transaction step status:', error);
      throw error;
    }
  }

  async submitTransactionStep(stepId: number): Promise<any> {
    try {
      const [updatedStep] = await db
        .update(transactionSteps)
        .set({
          status: 'submitted',
          submittedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(transactionSteps.id, stepId))
        .returning();

      return updatedStep;
    } catch (error) {
      console.error('Error submitting transaction step:', error);
      throw error;
    }
  }

  // Transaction Documents Management
  async uploadTransactionDocument(documentData: any): Promise<any> {
    try {
      const [newDocument] = await db
        .insert(transactionDocuments)
        .values(documentData)
        .returning();

      return newDocument;
    } catch (error) {
      console.error('Error uploading transaction document:', error);
      throw error;
    }
  }

  async getTransactionDocuments(stepId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(transactionDocuments)
        .where(eq(transactionDocuments.stepId, stepId))
        .orderBy(desc(transactionDocuments.uploadedAt));
    } catch (error) {
      console.error('Error fetching transaction documents:', error);
      return [];
    }
  }

  // Deal Messages Management
  async createDealMessage(messageData: any): Promise<any> {
    try {
      const [newMessage] = await db
        .insert(dealMessages)
        .values(messageData)
        .returning();

      return newMessage;
    } catch (error) {
      console.error('Error creating deal message:', error);
      throw error;
    }
  }

  async getDealMessages(dealId: number): Promise<any[]> {
    try {
      // Use raw SQL to handle joins with aliases - using recipient_id and message_content
      const messages = await db.execute(sql`
        SELECT 
          dm.id,
          dm.deal_id as "dealId",
          dm.sender_id as "senderId",
          dm.recipient_id as "receiverId",
          dm.message_content as "message",
          dm.is_read as "isRead",
          dm.sent_at as "createdAt",
          CONCAT(sender.first_name, ' ', sender.last_name) as "senderName",
          CONCAT(receiver.first_name, ' ', receiver.last_name) as "receiverName"
        FROM deal_messages dm
        LEFT JOIN users sender ON dm.sender_id = sender.id
        LEFT JOIN users receiver ON dm.recipient_id = receiver.id
        WHERE dm.deal_id = ${dealId}
        ORDER BY dm.sent_at
      `);
      
      return messages.rows || [];
    } catch (error) {
      console.error('Error fetching deal messages:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    try {
      await db
        .update(dealMessages)
        .set({ isRead: true })
        .where(eq(dealMessages.id, messageId));
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  // Create transaction progress tables if they don't exist
  async ensureTransactionTables(): Promise<void> {
    try {
      // Create transaction_steps table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS transaction_steps (
          id SERIAL PRIMARY KEY,
          deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
          step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 8),
          step_name TEXT NOT NULL,
          step_description TEXT NOT NULL,
          required_documents TEXT[] DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'refused', 'cancelled')),
          submitted_at TIMESTAMP,
          reviewed_at TIMESTAMP,
          admin_notes TEXT,
          admin_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(deal_id, step_number)
        )
      `);

      // Create transaction_documents table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS transaction_documents (
          id SERIAL PRIMARY KEY,
          step_id INTEGER NOT NULL REFERENCES transaction_steps(id) ON DELETE CASCADE,
          document_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          content_type TEXT,
          uploaded_by INTEGER NOT NULL REFERENCES users(id),
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create deal_messages table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS deal_messages (
          id SERIAL PRIMARY KEY,
          deal_id INTEGER NOT NULL REFERENCES broker_deals(id) ON DELETE CASCADE,
          sender_id INTEGER NOT NULL REFERENCES users(id),
          receiver_id INTEGER NOT NULL REFERENCES users(id),
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create deal_message_attachments table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS deal_message_attachments (
          id SERIAL PRIMARY KEY,
          message_id INTEGER NOT NULL REFERENCES deal_messages(id) ON DELETE CASCADE,
          file_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          content_type TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add ALL missing columns to broker_deals table
      await db.execute(sql`
        ALTER TABLE broker_deals 
        ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 8),
        ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'CIF-ASWP',
        ADD COLUMN IF NOT EXISTS buyer_company VARCHAR(255),
        ADD COLUMN IF NOT EXISTS seller_company VARCHAR(255),
        ADD COLUMN IF NOT EXISTS contract_value DECIMAL(15,2),
        ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 2.00,
        ADD COLUMN IF NOT EXISTS transaction_status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'medium',
        ADD COLUMN IF NOT EXISTS overall_progress INTEGER DEFAULT 0 CHECK (overall_progress BETWEEN 0 AND 100),
        ADD COLUMN IF NOT EXISTS estimated_completion_date DATE,
        ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'low',
        ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(30) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS document_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS assigned_admin_id INTEGER REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS deal_source VARCHAR(50) DEFAULT 'broker_portal',
        ADD COLUMN IF NOT EXISTS geographic_region VARCHAR(100),
        ADD COLUMN IF NOT EXISTS vessel_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS cargo_specifications TEXT,
        ADD COLUMN IF NOT EXISTS delivery_terms VARCHAR(50),
        ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100),
        ADD COLUMN IF NOT EXISTS insurance_details TEXT,
        ADD COLUMN IF NOT EXISTS special_conditions TEXT,
        ADD COLUMN IF NOT EXISTS internal_notes TEXT,
        ADD COLUMN IF NOT EXISTS client_communication_log TEXT
      `);

      // Update existing deals to have default values
      await db.execute(sql`
        UPDATE broker_deals 
        SET current_step = COALESCE(current_step, 1),
            transaction_type = COALESCE(transaction_type, 'CIF-ASWP'),
            transaction_status = COALESCE(transaction_status, 'pending'),
            priority_level = COALESCE(priority_level, 'medium'),
            commission_rate = COALESCE(commission_rate, 2.00),
            overall_progress = COALESCE(overall_progress, 0),
            risk_level = COALESCE(risk_level, 'low'),
            compliance_status = COALESCE(compliance_status, 'pending'),
            document_count = COALESCE(document_count, 0),
            last_activity_date = COALESCE(last_activity_date, CURRENT_TIMESTAMP),
            deal_source = COALESCE(deal_source, 'broker_portal')
        WHERE current_step IS NULL OR transaction_type IS NULL OR overall_progress IS NULL
      `);

      console.log('Transaction progress tables ensured');
    } catch (error) {
      console.error('Error ensuring transaction tables:', error);
    }
  }

  async createTransactionSteps(dealId: number): Promise<void> {
    try {
      // Ensure tables exist first
      await this.ensureTransactionTables();

      const steps = [
        {
          dealId,
          stepNumber: 1,
          stepName: "Buyer Issues PO",
          stepDescription: "Buyer submits Purchase Order with specifications",
          requiredDocuments: ["Purchase Order", "Company Registration", "Financial Statement"]
        },
        {
          dealId,
          stepNumber: 2,
          stepName: "ICPO",
          stepDescription: "Irrevocable Corporate Purchase Order submission",
          requiredDocuments: ["ICPO Document", "Bank Letter", "Passport Copy"]
        },
        {
          dealId,
          stepNumber: 3,
          stepName: "Contract Under Review",
          stepDescription: "Legal review and contract finalization",
          requiredDocuments: ["Signed Contract", "Legal Review", "Compliance Certificate"]
        },
        {
          dealId,
          stepNumber: 4,
          stepName: "PPOP Sent",
          stepDescription: "Past Performance of Product sent to buyer",
          requiredDocuments: ["PPOP Document", "Quality Certificate", "Previous Transaction Records"]
        },
        {
          dealId,
          stepNumber: 5,
          stepName: "Buyer Issues Bank Instrument",
          stepDescription: "Bank guarantee or letter of credit issued",
          requiredDocuments: ["Bank Instrument", "LC/SBLC", "Swift MT700"]
        },
        {
          dealId,
          stepNumber: 6,
          stepName: "Waiting for Bank Instrument",
          stepDescription: "Verification and processing of banking documents",
          requiredDocuments: ["Bank Verification", "Swift Confirmation", "Authorization Letter"]
        },
        {
          dealId,
          stepNumber: 7,
          stepName: "POP + 2% PB",
          stepDescription: "Proof of Product and Performance Bond submission",
          requiredDocuments: ["POP Document", "Performance Bond", "Insurance Certificate"]
        },
        {
          dealId,
          stepNumber: 8,
          stepName: "Commission",
          stepDescription: "Final commission payment and deal completion",
          requiredDocuments: ["Commission Agreement", "Payment Receipt", "Completion Certificate"]
        }
      ];

      await db.insert(transactionSteps).values(steps);
    } catch (error) {
      console.error('Error creating transaction steps:', error);
      throw error;
    }
  }

  async createBrokerDeal(deal: any): Promise<any> {
    try {
      const [newDeal] = await db.insert(brokerDeals).values(deal).returning();
      
      // Create default transaction steps for the new deal
      await this.createTransactionSteps(newDeal.id);
      
      // Update broker stats
      await this.updateBrokerStats(deal.brokerId);
      
      return newDeal;
    } catch (error) {
      console.error('Error creating broker deal:', error);
      throw error;
    }
  }

  async updateBrokerDeal(dealId: number, brokerId: number, dealData: any): Promise<any> {
    try {
      const [updatedDeal] = await db
        .update(brokerDeals)
        .set({ ...dealData, updatedAt: new Date() })
        .where(and(eq(brokerDeals.id, dealId), eq(brokerDeals.brokerId, brokerId)))
        .returning();
      
      // Update broker stats
      await this.updateBrokerStats(brokerId);
      
      return updatedDeal;
    } catch (error) {
      console.error('Error updating broker deal:', error);
      throw error;
    }
  }

  async deleteBrokerDeal(dealId: number, brokerId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(brokerDeals)
        .where(and(eq(brokerDeals.id, dealId), eq(brokerDeals.brokerId, brokerId)));
      
      // Update broker stats
      await this.updateBrokerStats(brokerId);
      
      return result.rowCount !== undefined && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting broker deal:', error);
      return false;
    }
  }

  // Broker Document Management
  async getBrokerDocuments(brokerId: number): Promise<any[]> {
    try {
      const documents = await db.select()
        .from(brokerDocuments)
        .where(eq(brokerDocuments.brokerId, brokerId))
        .orderBy(desc(brokerDocuments.createdAt));
      return documents;
    } catch (error) {
      console.error('Error fetching broker documents:', error);
      return [];
    }
  }

  async getBrokerDocument(documentId: number, brokerId: number): Promise<any | undefined> {
    try {
      const [document] = await db.select()
        .from(brokerDocuments)
        .where(and(eq(brokerDocuments.id, documentId), eq(brokerDocuments.brokerId, brokerId)));
      return document;
    } catch (error) {
      console.error('Error fetching broker document:', error);
      return undefined;
    }
  }

  async createBrokerDocument(document: any): Promise<any> {
    try {
      const [newDocument] = await db.insert(brokerDocuments).values(document).returning();
      return newDocument;
    } catch (error) {
      console.error('Error creating broker document:', error);
      throw error;
    }
  }

  async deleteBrokerDocument(documentId: number, brokerId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(brokerDocuments)
        .where(and(eq(brokerDocuments.id, documentId), eq(brokerDocuments.brokerId, brokerId)));
      return result.rowCount !== undefined && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting broker document:', error);
      return false;
    }
  }

  async incrementDocumentDownloadCount(documentId: number): Promise<void> {
    try {
      await db
        .update(brokerDocuments)
        .set({ downloadCount: sql`${brokerDocuments.downloadCount} + 1` })
        .where(eq(brokerDocuments.id, documentId));
    } catch (error) {
      console.error('Error incrementing document download count:', error);
    }
  }

  // Broker Admin File Management
  async getBrokerAdminFiles(brokerId: number): Promise<any[]> {
    try {
      const files = await db.select()
        .from(brokerAdminFiles)
        .where(eq(brokerAdminFiles.brokerId, brokerId))
        .orderBy(desc(brokerAdminFiles.createdAt));
      return files;
    } catch (error) {
      console.error('Error fetching broker admin files:', error);
      return [];
    }
  }

  async markBrokerAdminFileAsRead(fileId: number, brokerId: number): Promise<void> {
    try {
      await db
        .update(brokerAdminFiles)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(brokerAdminFiles.id, fileId), eq(brokerAdminFiles.brokerId, brokerId)));
    } catch (error) {
      console.error('Error marking broker admin file as read:', error);
    }
  }

  // Broker Statistics
  async getBrokerStats(brokerId: number): Promise<any | undefined> {
    try {
      const [stats] = await db.select()
        .from(brokerStats)
        .where(eq(brokerStats.brokerId, brokerId));
      return stats;
    } catch (error) {
      console.error('Error fetching broker stats:', error);
      return undefined;
    }
  }

  async updateBrokerStats(brokerId: number): Promise<void> {
    try {
      const deals = await this.getBrokerDeals(brokerId);
      
      const totalDeals = deals.length;
      const activeDeals = deals.filter(d => d.status === 'active').length;
      const completedDeals = deals.filter(d => d.status === 'completed').length;
      const cancelledDeals = deals.filter(d => d.status === 'cancelled').length;
      
      const totalValue = deals.reduce((sum, deal) => {
        const value = parseFloat(deal.totalValue?.toString().replace(/[^\d.]/g, '') || '0');
        return sum + value;
      }, 0);
      
      const totalCommission = deals.reduce((sum, deal) => {
        const commission = parseFloat(deal.commissionAmount?.toString().replace(/[^\d.]/g, '') || '0');
        return sum + commission;
      }, 0);
      
      const successRate = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0;
      const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
      
      const existingStats = await this.getBrokerStats(brokerId);
      
      if (existingStats) {
        await db
          .update(brokerStats)
          .set({
            totalDeals,
            activeDeals,
            completedDeals,
            cancelledDeals,
            totalValue: totalValue.toFixed(2),
            totalCommission: totalCommission.toFixed(2),
            successRate,
            averageDealSize: averageDealSize.toFixed(2),
            lastActivityAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(brokerStats.brokerId, brokerId));
      } else {
        await db
          .insert(brokerStats)
          .values({
            brokerId,
            totalDeals,
            activeDeals,
            completedDeals,
            cancelledDeals,
            totalValue: totalValue.toFixed(2),
            totalCommission: totalCommission.toFixed(2),
            successRate,
            averageDealSize: averageDealSize.toFixed(2),
            lastActivityAt: new Date()
          });
      }
    } catch (error) {
      console.error('Error updating broker stats:', error);
    }
  }

  // Transaction Step Management
  async getTransactionSteps(dealId: number): Promise<TransactionStep[]> {
    try {
      const steps = await db.select()
        .from(transactionSteps)
        .where(eq(transactionSteps.dealId, dealId))
        .orderBy(transactionSteps.stepNumber);
      return steps;
    } catch (error) {
      console.error('Error fetching transaction steps:', error);
      return [];
    }
  }

  async submitTransactionStep(stepId: number, notes?: string): Promise<TransactionStep> {
    try {
      const [updatedStep] = await db
        .update(transactionSteps)
        .set({
          status: 'submitted',
          submittedAt: new Date(),
          brokerNotes: notes,
          updatedAt: new Date()
        })
        .where(eq(transactionSteps.id, stepId))
        .returning();
      return updatedStep;
    } catch (error) {
      console.error('Error submitting transaction step:', error);
      throw error;
    }
  }

  // Transaction Document Management
  async getTransactionStepDocuments(stepId: number): Promise<TransactionDocument[]> {
    try {
      const documents = await db.select()
        .from(transactionDocuments)
        .where(eq(transactionDocuments.stepId, stepId))
        .orderBy(desc(transactionDocuments.uploadedAt));
      return documents;
    } catch (error) {
      console.error('Error fetching transaction step documents:', error);
      return [];
    }
  }

  async createTransactionDocument(document: InsertTransactionDocument): Promise<TransactionDocument> {
    try {
      const [newDocument] = await db
        .insert(transactionDocuments)
        .values(document)
        .returning();
      return newDocument;
    } catch (error) {
      console.error('Error creating transaction document:', error);
      throw error;
    }
  }

  async getAllTransactionDocumentsByBroker(brokerId: number): Promise<any[]> {
    try {
      const documents = await db.select({
        id: transactionDocuments.id,
        stepId: transactionDocuments.stepId,
        dealId: transactionDocuments.dealId,
        documentType: transactionDocuments.documentType,
        originalFilename: transactionDocuments.originalFilename,
        storedFilename: transactionDocuments.storedFilename,
        filePath: transactionDocuments.filePath,
        fileSize: transactionDocuments.fileSize,
        mimeType: transactionDocuments.mimeType,
        uploadedBy: transactionDocuments.uploadedBy,
        uploadedAt: transactionDocuments.uploadedAt,
        dealTitle: brokerDeals.dealTitle,
        stepName: transactionSteps.stepName,
        stepNumber: transactionSteps.stepNumber
      })
      .from(transactionDocuments)
      .leftJoin(transactionSteps, eq(transactionDocuments.stepId, transactionSteps.id))
      .leftJoin(brokerDeals, eq(transactionDocuments.dealId, brokerDeals.id))
      .where(eq(brokerDeals.brokerId, brokerId))
      .orderBy(desc(transactionDocuments.uploadedAt));
      
      return documents;
    } catch (error) {
      console.error('Error fetching all transaction documents for broker:', error);
      return [];
    }
  }

  async getTransactionDocumentById(documentId: number): Promise<TransactionDocument | undefined> {
    try {
      const [document] = await db.select()
        .from(transactionDocuments)
        .where(eq(transactionDocuments.id, documentId));
      return document;
    } catch (error) {
      console.error('Error fetching transaction document by ID:', error);
      return undefined;
    }
  }

  // Deal Message Management
  async createDealMessage(message: InsertDealMessage): Promise<DealMessage> {
    try {
      const [newMessage] = await db
        .insert(dealMessages)
        .values(message)
        .returning();
      return newMessage;
    } catch (error) {
      console.error('Error creating deal message:', error);
      throw error;
    }
  }

  // Broker Card Application Management
  async createBrokerCardApplication(application: InsertBrokerCardApplication): Promise<BrokerCardApplication> {
    try {
      const [newApplication] = await db
        .insert(brokerCardApplications)
        .values(application)
        .returning();
      return newApplication;
    } catch (error) {
      console.error('Error creating broker card application:', error);
      throw error;
    }
  }

  async getBrokerCardApplication(userId: number): Promise<BrokerCardApplication | undefined> {
    try {
      const [application] = await db
        .select()
        .from(brokerCardApplications)
        .where(eq(brokerCardApplications.submittedBy, userId))
        .orderBy(desc(brokerCardApplications.submittedAt));
      return application;
    } catch (error) {
      console.error('Error fetching broker card application:', error);
      return undefined;
    }
  }

  async getBrokerCardApplicationById(id: number): Promise<BrokerCardApplication | undefined> {
    try {
      const [application] = await db
        .select()
        .from(brokerCardApplications)
        .where(eq(brokerCardApplications.id, id));
      return application;
    } catch (error) {
      console.error('Error fetching broker card application by ID:', error);
      return undefined;
    }
  }

  async updateBrokerCardApplication(id: number, updates: Partial<BrokerCardApplication>): Promise<BrokerCardApplication | undefined> {
    try {
      const [updatedApplication] = await db
        .update(brokerCardApplications)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(brokerCardApplications.id, id))
        .returning();
      return updatedApplication;
    } catch (error) {
      console.error('Error updating broker card application:', error);
      return undefined;
    }
  }

  async getAllBrokerCardApplications(): Promise<BrokerCardApplication[]> {
    try {
      const applications = await db
        .select()
        .from(brokerCardApplications)
        .orderBy(desc(brokerCardApplications.submittedAt));
      return applications;
    } catch (error) {
      console.error('Error fetching all broker card applications:', error);
      return [];
    }
  }

  // CHAT SYSTEM METHODS
  
  async createChatConversation(brokerId: number, adminId: number | null, title: string, priority: string = 'normal'): Promise<any> {
    try {
      const [conversation] = await db.insert(chatConversations)
        .values({
          brokerId,
          adminId,
          title,
          priority,
          status: 'active'
        })
        .returning();
      
      // Add participants
      await db.insert(chatParticipants).values([
        { conversationId: conversation.id, userId: brokerId, role: 'broker' },
        ...(adminId ? [{ conversationId: conversation.id, userId: adminId, role: 'admin' }] : [])
      ]);
      
      return conversation;
    } catch (error) {
      console.error('Error creating chat conversation:', error);
      throw error;
    }
  }

  async getBrokerConversations(brokerId: number): Promise<any[]> {
    try {
      const conversations = await db
        .select({
          id: chatConversations.id,
          title: chatConversations.title,
          status: chatConversations.status,
          priority: chatConversations.priority,
          createdAt: chatConversations.createdAt,
          lastMessageAt: chatConversations.lastMessageAt,
          adminId: chatConversations.adminId,
        })
        .from(chatConversations)
        .where(eq(chatConversations.brokerId, brokerId))
        .orderBy(desc(chatConversations.lastMessageAt));
      
      return conversations;
    } catch (error) {
      console.error('Error fetching broker conversations:', error);
      return [];
    }
  }

  async getConversationMessages(conversationId: number): Promise<any[]> {
    try {
      const messages = await db
        .select({
          id: chatMessages.id,
          conversationId: chatMessages.conversationId,
          senderId: chatMessages.senderId,
          messageText: chatMessages.messageText,
          messageType: chatMessages.messageType,
          filePath: chatMessages.filePath,
          fileName: chatMessages.fileName,
          fileSize: chatMessages.fileSize,
          isRead: chatMessages.isRead,
          createdAt: chatMessages.createdAt,
          senderName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          senderRole: users.role,
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.senderId, users.id))
        .where(eq(chatMessages.conversationId, conversationId))
        .orderBy(asc(chatMessages.createdAt));
      
      return messages;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      return [];
    }
  }

  async sendChatMessage(conversationId: number, senderId: number, messageText: string, messageType: string = 'text'): Promise<any> {
    try {
      const [message] = await db.insert(chatMessages)
        .values({
          conversationId,
          senderId,
          messageText,
          messageType,
        })
        .returning();
      
      // Update conversation last message time
      await db.update(chatConversations)
        .set({ lastMessageAt: new Date(), updatedAt: new Date() })
        .where(eq(chatConversations.id, conversationId));
      
      return message;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    try {
      await db.update(chatMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(chatMessages.conversationId, conversationId),
            ne(chatMessages.senderId, userId)
          )
        );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(chatMessages)
        .leftJoin(chatConversations, eq(chatMessages.conversationId, chatConversations.id))
        .where(
          and(
            eq(chatConversations.brokerId, userId),
            eq(chatMessages.isRead, false),
            ne(chatMessages.senderId, userId)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();