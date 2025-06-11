import { pgTable, text, serial, integer, decimal, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Custom authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // user, admin, broker
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  interval: text("interval").notNull().default("monthly"), // monthly, yearly
  features: text("features").array(),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull().default("trial"), // trial, active, cancelled, expired
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end"),
  billingInterval: text("billing_interval").notNull().default("monthly"), // monthly, yearly
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  subscription: one(userSubscriptions, {
    fields: [users.id],
    references: [userSubscriptions.userId],
  }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
  billingInterval: true,
});

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Vessels table
export const vessels = pgTable("vessels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imo: text("imo").notNull().unique(),
  mmsi: text("mmsi").notNull(),
  vesselType: text("vessel_type").notNull(),
  flag: text("flag").notNull(),
  built: integer("built"),
  deadweight: integer("deadweight"),
  length: text("length"),
  cargoCapacity: integer("cargo_capacity"),
  currentLat: text("current_lat"),
  currentLng: text("current_lng"),
  status: text("status"),
  departurePort: text("departure_port"),
  destinationPort: text("destination_port"),
  departureDate: timestamp("departure_date"),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  quantity: text("quantity"),
  dealValue: text("deal_value"),
  price: text("price"),
  marketPrice: text("market_price"),
  routeDistance: text("route_distance"),
  destinationLat: text("destination_lat"),
  destinationLng: text("destination_lng"),
  departureLat: text("departure_lat"),
  departureLng: text("departure_lng"),
  speed: text("speed"),
  course: text("course"),
  draught: text("draught"),
  eta: timestamp("eta"),
  ata: timestamp("ata"),
  lastUpdated: timestamp("last_updated"),
  metadata: text("metadata"),
});

export const insertVesselSchema = createInsertSchema(vessels).omit({
  id: true,
});

// Refineries table
export const refineries = pgTable("refineries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 6 }).notNull(),
  capacity: integer("capacity"),
  type: text("type"),
  status: text("status"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  description: text("description"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  currency: text("currency"),
  nextInspection: timestamp("next_inspection"),
});

export const insertRefinerySchema = createInsertSchema(refineries).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// Progress Events table
export const progressEvents = pgTable("progress_events", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").references(() => vessels.id),
  vesselName: text("vessel_name"),
  timestamp: timestamp("timestamp").defaultNow(),
  eventType: text("event_type").notNull(), // departure, arrival, port_call, delay, etc.
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  location: text("location"),
});

export const insertProgressEventSchema = createInsertSchema(progressEvents).omit({
  id: true,
});

// Stats table
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  activeVessels: integer("active_vessels").default(0),
  totalCargo: decimal("total_cargo", { precision: 15, scale: 2 }).default("0"),
  activeRefineries: integer("active_refineries").default(0),
  activeBrokers: integer("active_brokers").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type InsertVessel = z.infer<typeof insertVesselSchema>;
export type Vessel = typeof vessels.$inferSelect;
export type InsertRefinery = z.infer<typeof insertRefinerySchema>;
export type Refinery = typeof refineries.$inferSelect;
export type InsertProgressEvent = z.infer<typeof insertProgressEventSchema>;
export type ProgressEvent = typeof progressEvents.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

// Real Companies - Professional data entered by admin
export const realCompanies = pgTable("real_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  address: text("address"),
  logo: text("logo"),
  description: text("description"),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  founded: integer("founded"),
  employees: integer("employees"),
  revenue: text("revenue"),
  headquarters: text("headquarters"),
  ceo: text("ceo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fake Companies - User-facing display names linked to real companies
export const fakeCompanies = pgTable("fake_companies", {
  id: serial("id").primaryKey(),
  generatedName: text("generated_name").notNull(),
  realCompanyId: integer("real_company_id").notNull().references(() => realCompanies.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const realCompaniesRelations = relations(realCompanies, ({ many }) => ({
  fakeCompanies: many(fakeCompanies),
}));

export const fakeCompaniesRelations = relations(fakeCompanies, ({ one }) => ({
  realCompany: one(realCompanies, {
    fields: [fakeCompanies.realCompanyId],
    references: [realCompanies.id],
  }),
}));

// Insert schemas
export const insertRealCompanySchema = createInsertSchema(realCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFakeCompanySchema = createInsertSchema(fakeCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type RealCompany = typeof realCompanies.$inferSelect;
export type InsertRealCompany = z.infer<typeof insertRealCompanySchema>;
export type FakeCompany = typeof fakeCompanies.$inferSelect;
export type InsertFakeCompany = z.infer<typeof insertFakeCompanySchema>;

// Broker Deals - When brokers click "Request Deal" on companies
export const brokerDeals = pgTable("broker_deals", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id),
  fakeCompanyId: integer("fake_company_id").notNull().references(() => fakeCompanies.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  dealValue: text("deal_value"), // Optional deal value
  notes: text("notes"), // Broker's notes about the deal
  adminNotes: text("admin_notes"), // Admin's notes about the deal
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Broker Documents - Files that admin sends to brokers
export const brokerDocuments = pgTable("broker_documents", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // pdf, doc, docx, etc.
  fileSize: integer("file_size"), // in bytes
  title: text("title"), // Document title/description
  uploadedByAdmin: integer("uploaded_by_admin").references(() => users.id),
  isRead: boolean("is_read").default(false), // Has broker read this document
  createdAt: timestamp("created_at").defaultNow(),
});

// Oil Market Alerts - Static alerts for brokers
export const oilMarketAlerts = pgTable("oil_market_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  alertType: text("alert_type").notNull().default("info"), // info, warning, success, error
  priority: text("priority").notNull().default("medium"), // low, medium, high
  isActive: boolean("is_active").default(true),
  targetBrokers: text("target_brokers"), // JSON array of broker IDs, null for all brokers
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration date
});

// Relations for broker deals
export const brokerDealsRelations = relations(brokerDeals, ({ one }) => ({
  broker: one(users, {
    fields: [brokerDeals.brokerId],
    references: [users.id],
  }),
  fakeCompany: one(fakeCompanies, {
    fields: [brokerDeals.fakeCompanyId],
    references: [fakeCompanies.id],
  }),
}));

// Relations for broker documents
export const brokerDocumentsRelations = relations(brokerDocuments, ({ one }) => ({
  broker: one(users, {
    fields: [brokerDocuments.brokerId],
    references: [users.id],
  }),
  uploadedBy: one(users, {
    fields: [brokerDocuments.uploadedByAdmin],
    references: [users.id],
  }),
}));

// Insert schemas for broker features
export const insertBrokerDealSchema = createInsertSchema(brokerDeals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrokerDocumentSchema = createInsertSchema(brokerDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertOilMarketAlertSchema = createInsertSchema(oilMarketAlerts).omit({
  id: true,
  createdAt: true,
});

// Types for broker features
export type BrokerDeal = typeof brokerDeals.$inferSelect;
export type InsertBrokerDeal = z.infer<typeof insertBrokerDealSchema>;
export type BrokerDocument = typeof brokerDocuments.$inferSelect;
export type InsertBrokerDocument = z.infer<typeof insertBrokerDocumentSchema>;
export type OilMarketAlert = typeof oilMarketAlerts.$inferSelect;
export type InsertOilMarketAlert = z.infer<typeof insertOilMarketAlertSchema>;

// Ports - Complete comprehensive table structure
export const ports = pgTable("ports", {
  id: serial("id").primaryKey(),
  
  // Basic Information
  name: text("name").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  city: text("city"),
  timezone: text("timezone"),
  
  // Geographic Coordinates
  lat: decimal("lat", { precision: 10, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 6 }).notNull(),
  
  // Port Classification
  type: text("type").default("commercial"), // commercial, oil_terminal, container, bulk, fishing, naval, cruise, industrial
  status: text("status").default("operational"), // operational, maintenance, limited, closed, under_construction
  
  // Operational Information
  capacity: integer("capacity"), // handling capacity in TEU or tons per day
  annualThroughput: integer("annual_throughput"), // annual cargo throughput
  operatingHours: text("operating_hours"), // "24/7" or specific hours
  description: text("description"),
  
  // Port Authority & Management
  portAuthority: text("port_authority"),
  operator: text("operator"),
  owner: text("owner"),
  
  // Infrastructure Details
  maxVesselSize: text("max_vessel_size"), // maximum vessel length or DWT
  channelDepth: decimal("channel_depth", { precision: 5, scale: 2 }), // in meters
  berthingLength: integer("berthing_length"), // total berthing length in meters
  numberOfBerths: integer("number_of_berths"),
  craneCapacity: integer("crane_capacity"), // maximum crane capacity in tons
  storageCapacity: integer("storage_capacity"), // storage capacity in cubic meters or tons
  
  // Services & Facilities
  services: text("services"), // JSON array of available services
  facilities: text("facilities"), // JSON array of facilities
  fuelAvailable: boolean("fuel_available").default(false),
  freshWaterAvailable: boolean("fresh_water_available").default(false),
  repairFacilities: boolean("repair_facilities").default(false),
  wasteDisposal: boolean("waste_disposal").default(false),
  
  // Contact Information
  harborMaster: text("harbor_master"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  
  // Economic Information
  portCharges: text("port_charges"), // JSON object with different charges
  currency: text("currency").default("USD"),
  
  // Environmental & Regulatory
  environmentalCertifications: text("environmental_certifications"), // JSON array
  iceClass: text("ice_class"), // ice-breaking capabilities
  customsOffice: text("customs_office"),
  immigrationOffice: text("immigration_office"),
  
  // Weather & Conditions
  averageWindSpeed: decimal("average_wind_speed", { precision: 4, scale: 1 }),
  averageWaveHeight: decimal("average_wave_height", { precision: 4, scale: 1 }),
  tidalRange: decimal("tidal_range", { precision: 4, scale: 2 }),
  
  // Connectivity
  railConnections: boolean("rail_connections").default(false),
  roadConnections: boolean("road_connections").default(false),
  airportDistance: integer("airport_distance"), // distance to nearest airport in km
  
  // Historical & Statistical Data
  yearlyVesselCalls: integer("yearly_vessel_calls"),
  averageWaitingTime: decimal("average_waiting_time", { precision: 4, scale: 1 }), // in hours
  efficiencyRating: decimal("efficiency_rating", { precision: 3, scale: 2 }), // 1.00 to 5.00
  
  // Administrative
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
  dataSource: text("data_source"), // where the data came from
  lastVerified: timestamp("last_verified"),
});

export const insertPortSchema = createInsertSchema(ports).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertPort = z.infer<typeof insertPortSchema>;
export type Port = typeof ports.$inferSelect;