import { eq, and } from "drizzle-orm";
import { db, supabase } from "./db";
import {
  users, vessels, refineries, progressEvents, documents, brokers, stats as statsTable, ports, refineryPortConnections, companies,
  subscriptionPlans, subscriptions, paymentMethods, invoices,
  User, InsertUser, 
  Vessel, InsertVessel,
  Refinery, InsertRefinery,
  ProgressEvent, InsertProgressEvent,
  Document, InsertDocument,
  Broker, InsertBroker,
  Stats, InsertStats,
  Port, InsertPort,
  RefineryPortConnection, InsertRefineryPortConnection,
  Company, InsertCompany,
  SubscriptionPlan, InsertSubscriptionPlan,
  Subscription, InsertSubscription,
  PaymentMethod, InsertPaymentMethod,
  Invoice, InsertInvoice
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  
  // Refinery-Port Connection methods
  getRefineryPortConnections(): Promise<RefineryPortConnection[]>;
  getRefineryPortConnectionById(id: number): Promise<RefineryPortConnection | undefined>;
  getRefineryPortConnectionsByRefineryId(refineryId: number): Promise<RefineryPortConnection[]>;
  getRefineryPortConnectionsByPortId(portId: number): Promise<RefineryPortConnection[]>;
  createRefineryPortConnection(connection: InsertRefineryPortConnection): Promise<RefineryPortConnection>;
  updateRefineryPortConnection(id: number, connection: Partial<InsertRefineryPortConnection>): Promise<RefineryPortConnection | undefined>;
  deleteRefineryPortConnection(id: number): Promise<boolean>;
  
  // Company methods
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<Company | undefined>;
  getCompaniesByRegion(region: string): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  createCompaniesBulk(companies: InsertCompany[]): Promise<Company[]>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !user) return undefined;
    return user as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !user) return undefined;
    return user as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
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
    const { data, error } = await supabase
      .from('vessels')
      .select('*');
    
    if (error) {
      console.error("Error fetching vessels:", error);
      return [];
    }
    
    return data as Vessel[];
  }

  async getVesselById(id: number): Promise<Vessel | undefined> {
    const { data, error } = await supabase
      .from('vessels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Vessel;
  }

  async getVesselsByRegion(region: string): Promise<Vessel[]> {
    const { data, error } = await supabase
      .from('vessels')
      .select('*')
      .eq('current_region', region);
    
    if (error) {
      console.error(`Error fetching vessels for region ${region}:`, error);
      return [];
    }
    
    return data as Vessel[];
  }

  async createVessel(insertVessel: InsertVessel): Promise<Vessel> {
    try {
      // Convert camelCase to snake_case for Supabase column names
      const transformedVessel = {
        name: insertVessel.name,
        imo: insertVessel.imo,
        mmsi: insertVessel.mmsi,
        vessel_type: insertVessel.vesselType,
        flag: insertVessel.flag,
        built: insertVessel.built,
        deadweight: insertVessel.deadweight,
        current_lat: insertVessel.currentLat,
        current_lng: insertVessel.currentLng,
        departure_port: insertVessel.departurePort,
        departure_date: insertVessel.departureDate,
        departure_lat: insertVessel.departureLat,
        departure_lng: insertVessel.departureLng,
        destination_port: insertVessel.destinationPort,
        destination_lat: insertVessel.destinationLat,
        destination_lng: insertVessel.destinationLng,
        eta: insertVessel.eta,
        cargo_type: insertVessel.cargoType,
        cargo_capacity: insertVessel.cargoCapacity,
        current_region: insertVessel.currentRegion,
        buyer_name: insertVessel.buyerName,
        seller_name: insertVessel.sellerName,
        metadata: insertVessel.metadata,
      };
      
      const { data, error } = await supabase
        .from('vessels')
        .insert(transformedVessel)
        .select()
        .single();
        
      if (error) {
        console.error(`Error creating vessel ${insertVessel.name}:`, error);
        // Return a minimal vessel object to prevent app crashes
        return {
          id: 0,
          name: insertVessel.name,
          imo: insertVessel.imo,
          mmsi: insertVessel.mmsi,
          vesselType: insertVessel.vesselType,
          flag: insertVessel.flag,
          built: insertVessel.built || 0,
          deadweight: insertVessel.deadweight || 0,
          currentLat: insertVessel.currentLat || 0,
          currentLng: insertVessel.currentLng || 0,
          lastUpdated: new Date()
        } as Vessel;
      }

      // Convert snake_case back to camelCase for our app
      return {
        id: data.id,
        name: data.name,
        imo: data.imo,
        mmsi: data.mmsi,
        vesselType: data.vessel_type,
        flag: data.flag,
        built: data.built,
        deadweight: data.deadweight,
        currentLat: data.current_lat,
        currentLng: data.current_lng,
        departurePort: data.departure_port,
        departureDate: data.departure_date ? new Date(data.departure_date) : null,
        departureLat: data.departure_lat,
        departureLng: data.departure_lng,
        destinationPort: data.destination_port,
        destinationLat: data.destination_lat,
        destinationLng: data.destination_lng,
        eta: data.eta ? new Date(data.eta) : null,
        cargoType: data.cargo_type,
        cargoCapacity: data.cargo_capacity,
        currentRegion: data.current_region,
        buyerName: data.buyer_name,
        sellerName: data.seller_name,
        metadata: data.metadata,
        lastUpdated: data.last_updated ? new Date(data.last_updated) : new Date()
      } as Vessel;
    } catch (err) {
      console.error(`Exception creating vessel:`, err);
      // Return a minimal vessel object to prevent app crashes
      return {
        id: 0,
        name: insertVessel.name,
        imo: insertVessel.imo,
        mmsi: insertVessel.mmsi,
        vesselType: insertVessel.vesselType,
        flag: insertVessel.flag,
        built: insertVessel.built || 0,
        deadweight: insertVessel.deadweight || 0,
        currentLat: insertVessel.currentLat || 0,
        currentLng: insertVessel.currentLng || 0,
        lastUpdated: new Date()
      } as Vessel;
    }
  }

  async updateVessel(id: number, vesselUpdate: Partial<InsertVessel>): Promise<Vessel | undefined> {
    const { data, error } = await supabase
      .from('vessels')
      .update(vesselUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating vessel ${id}:`, error);
      return undefined;
    }
    
    return data as Vessel;
  }

  async deleteVessel(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('vessels')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting vessel ${id}:`, error);
      return false;
    }
    
    return true;
  }

  async getRefineries(): Promise<Refinery[]> {
    try {
      const { data, error } = await supabase
        .from('refineries')
        .select('*');
        
      if (error) {
        console.error('Error fetching refineries:', error);
        return [];
      }
      
      return data as Refinery[] || [];
    } catch (err) {
      console.error('Exception fetching refineries:', err);
      return [];
    }
  }

  async getRefineryById(id: number): Promise<Refinery | undefined> {
    try {
      const { data, error } = await supabase
        .from('refineries')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching refinery ${id}:`, error);
        return undefined;
      }
      
      return data as Refinery;
    } catch (err) {
      console.error(`Exception fetching refinery ${id}:`, err);
      return undefined;
    }
  }

  async getRefineryByRegion(region: string): Promise<Refinery[]> {
    try {
      const { data, error } = await supabase
        .from('refineries')
        .select('*')
        .eq('region', region);
        
      if (error) {
        console.error(`Error fetching refineries by region ${region}:`, error);
        return [];
      }
      
      return data as Refinery[] || [];
    } catch (err) {
      console.error(`Exception fetching refineries by region ${region}:`, err);
      return [];
    }
  }

  async createRefinery(insertRefinery: InsertRefinery): Promise<Refinery> {
    try {
      // Convert camelCase fields to snake_case if needed
      const transformedRefinery = {
        name: insertRefinery.name,
        country: insertRefinery.country,
        region: insertRefinery.region,
        lat: insertRefinery.lat,
        lng: insertRefinery.lng,
        capacity: insertRefinery.capacity,
        status: insertRefinery.status,
        description: insertRefinery.description
      };
      
      const { data, error } = await supabase
        .from('refineries')
        .insert(transformedRefinery)
        .select()
        .single();
        
      if (error) {
        console.error(`Error creating refinery ${insertRefinery.name}:`, error);
        // Return a minimal refinery object to prevent app crashes
        return {
          id: 0,
          name: insertRefinery.name,
          country: insertRefinery.country,
          region: insertRefinery.region, 
          lat: insertRefinery.lat,
          lng: insertRefinery.lng,
          capacity: insertRefinery.capacity || 0,
          status: 'unknown',
          description: ''
        } as Refinery;
      }
      
      return data as Refinery;
    } catch (err) {
      console.error(`Exception creating refinery:`, err);
      // Return a minimal refinery object to prevent app crashes
      return {
        id: 0,
        name: insertRefinery.name,
        country: insertRefinery.country,
        region: insertRefinery.region,
        lat: insertRefinery.lat,
        lng: insertRefinery.lng,
        capacity: insertRefinery.capacity || 0,
        status: 'unknown',
        description: ''
      } as Refinery;
    }
  }

  async updateRefinery(id: number, refineryUpdate: Partial<InsertRefinery>): Promise<Refinery | undefined> {
    try {  
      const { data, error } = await supabase
        .from('refineries')
        .update(refineryUpdate)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating refinery ${id}:`, error);
        return undefined;
      }
      
      return data as Refinery;
    } catch (err) {
      console.error(`Exception updating refinery ${id}:`, err);
      return undefined;
    }
  }

  async deleteRefinery(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('refineries')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting refinery ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error(`Exception deleting refinery ${id}:`, err);
      return false;
    }
  }

  // Port methods implementation
  async getPorts(): Promise<Port[]> {
    const { data, error } = await supabase
      .from('ports')
      .select('*');
    
    if (error) {
      console.error("Error fetching ports:", error);
      return [];
    }
    
    return data as Port[];
  }

  async getPortById(id: number): Promise<Port | undefined> {
    const { data, error } = await supabase
      .from('ports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Port;
  }

  async getPortsByRegion(region: string): Promise<Port[]> {
    const { data, error } = await supabase
      .from('ports')
      .select('*')
      .eq('region', region);
    
    if (error) {
      console.error(`Error fetching ports for region ${region}:`, error);
      return [];
    }
    
    return data as Port[];
  }

  async createPort(insertPort: InsertPort): Promise<Port> {
    const { data, error } = await supabase
      .from('ports')
      .insert(insertPort)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating port:", error);
      throw error;
    }
    
    return data as Port;
  }
  
  async createPortsBulk(insertPorts: InsertPort[]): Promise<Port[]> {
    // If no ports provided, return empty array
    if (!insertPorts || insertPorts.length === 0) {
      return [];
    }
    
    try {
      // Insert all ports in a single database operation
      const { data, error } = await supabase
        .from('ports')
        .insert(insertPorts)
        .select();
      
      if (error) {
        throw error;
      }
      
      return data as Port[];
    } catch (error) {
      console.error("Error in bulk port insertion:", error);
      
      // Fall back to individual inserts if bulk insert fails
      console.log("Falling back to individual port insertions");
      const results: Port[] = [];
      
      for (const port of insertPorts) {
        try {
          const { data, error } = await supabase
            .from('ports')
            .insert(port)
            .select()
            .single();
          
          if (error) throw error;
          if (data) results.push(data as Port);
        } catch (singleError) {
          console.error(`Error inserting port ${port.name}:`, singleError);
          // Continue with the next port
        }
      }
      
      return results;
    }
  }

  async updatePort(id: number, portUpdate: Partial<InsertPort>): Promise<Port | undefined> {
    const { data, error } = await supabase
      .from('ports')
      .update(portUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating port ${id}:`, error);
      return undefined;
    }
    
    return data as Port;
  }

  async deletePort(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('ports')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting port ${id}:`, error);
      return false;
    }
    
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
}

// Use database storage
export const storage = new DatabaseStorage();