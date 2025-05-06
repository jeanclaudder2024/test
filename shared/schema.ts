import { mysqlTable, text, serial, int, boolean, timestamp, json, varchar, decimal, primaryKey, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Now nullable to support OAuth providers
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }), // Add phone number field
  isSubscribed: boolean("is_subscribed"),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  // OAuth provider fields
  provider: varchar("provider", { length: 50 }), // 'google', 'local', etc.
  providerId: varchar("provider_id", { length: 255 }), // ID from the provider
  photoURL: varchar("photo_url", { length: 512 }), // Profile photo URL from provider
  displayName: varchar("display_name", { length: 255 }), // Full name from provider
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  provider: true,
  providerId: true,
  photoURL: true,
  displayName: true,
});

// Vessels
export const vessels = mysqlTable("vessels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imo: varchar("imo", { length: 50 }).notNull().unique(),
  mmsi: varchar("mmsi", { length: 50 }).notNull(),
  vesselType: varchar("vessel_type", { length: 100 }).notNull(),
  flag: varchar("flag", { length: 100 }).notNull(),
  built: int("built"),
  deadweight: int("deadweight"),
  currentLat: decimal("current_lat", { precision: 10, scale: 6 }),
  currentLng: decimal("current_lng", { precision: 10, scale: 6 }),
  departurePort: varchar("departure_port", { length: 255 }),
  departureDate: timestamp("departure_date"),
  departureLat: decimal("departure_lat", { precision: 10, scale: 6 }),
  departureLng: decimal("departure_lng", { precision: 10, scale: 6 }),
  destinationPort: varchar("destination_port", { length: 255 }), // Will store refinery references in format "REF:id:name"
  destinationLat: decimal("destination_lat", { precision: 10, scale: 6 }),
  destinationLng: decimal("destination_lng", { precision: 10, scale: 6 }),  
  eta: timestamp("eta"),
  cargoType: varchar("cargo_type", { length: 100 }),
  cargoCapacity: int("cargo_capacity"),
  currentRegion: varchar("current_region", { length: 100 }),
  buyerName: varchar("buyer_name", { length: 255 }).default("NA"),
  sellerName: varchar("seller_name", { length: 255 }),
  metadata: varchar("metadata", { length: 1000 }), // JSON string with additional vessel information (heading, speed, course, etc.)
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertVesselSchema = createInsertSchema(vessels).omit({
  id: true,
  lastUpdated: true,
});

// Refineries
export const refineries = mysqlTable("refineries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 6 }).notNull(),
  capacity: int("capacity"), // in barrels per day
  status: varchar("status", { length: 50 }).default("active"),
  description: varchar("description", { length: 1000 }),
});

export const insertRefinerySchema = createInsertSchema(refineries).omit({
  id: true,
});

// Progress Events
export const progressEvents = mysqlTable("progress_events", {
  id: serial("id").primaryKey(),
  vesselId: int("vessel_id").notNull(),
  date: timestamp("date").notNull(),
  event: varchar("event", { length: 500 }).notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  location: varchar("location", { length: 255 }),
});

export const insertProgressEventSchema = createInsertSchema(progressEvents).omit({
  id: true,
});

// Documents
export const documents = mysqlTable("documents", {
  id: serial("id").primaryKey(),
  vesselId: int("vessel_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // e.g., SDS, LOI, BL
  title: varchar("title", { length: 255 }).notNull(),
  content: varchar("content", { length: 10000 }).notNull(),
  status: varchar("status", { length: 50 }).default("active"), // active, expired, pending, revoked
  issueDate: timestamp("issue_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  reference: varchar("reference", { length: 100 }), // Document reference number
  issuer: varchar("issuer", { length: 255 }), // Organization that issued document
  recipientName: varchar("recipient_name", { length: 255 }),
  recipientOrg: varchar("recipient_org", { length: 255 }),
  lastModified: timestamp("last_modified").defaultNow(),
  language: varchar("language", { length: 10 }).default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  lastModified: true,
}).extend({
  // Allow string input for dates
  issueDate: z.string().optional(),
  expiryDate: z.string().optional()
});

// Brokers
export const brokers = mysqlTable("brokers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  country: varchar("country", { length: 100 }),
  active: boolean("active").default(true),
  
  // Elite Membership fields
  eliteMember: boolean("elite_member").default(false),
  eliteMemberSince: timestamp("elite_member_since"),
  eliteMemberExpires: timestamp("elite_member_expires"),
  membershipId: varchar("membership_id", { length: 100 }),
  
  // Additional contact and subscription information
  shippingAddress: varchar("shipping_address", { length: 500 }),
  subscriptionPlan: varchar("subscription_plan", { length: 100 }),
  lastLogin: timestamp("last_login"),
});

export const insertBrokerSchema = createInsertSchema(brokers).omit({
  id: true,
});

// Stats
export const stats = mysqlTable("stats", {
  id: serial("id").primaryKey(),
  activeVessels: int("active_vessels").default(0),
  totalCargo: decimal("total_cargo", { precision: 15, scale: 2 }).default("0"),
  activeRefineries: int("active_refineries").default(0),
  activeBrokers: int("active_brokers").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
  lastUpdated: true,
});

// Type Exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVessel = z.infer<typeof insertVesselSchema>;
export type Vessel = typeof vessels.$inferSelect;

export type InsertRefinery = z.infer<typeof insertRefinerySchema>;
export type Refinery = typeof refineries.$inferSelect;

export type InsertProgressEvent = z.infer<typeof insertProgressEventSchema>;
export type ProgressEvent = typeof progressEvents.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertBroker = z.infer<typeof insertBrokerSchema>;
export type Broker = typeof brokers.$inferSelect;

// Ports
export const ports = mysqlTable("ports", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 6 }).notNull(),
  type: varchar("type", { length: 50 }).default("commercial"), // commercial, oil, container, bulk, etc.
  capacity: int("capacity"), // handling capacity in TEU or tons per day
  status: varchar("status", { length: 50 }).default("active"),
  description: varchar("description", { length: 1000 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertPortSchema = createInsertSchema(ports).omit({
  id: true,
  lastUpdated: true,
}).transform((port) => ({
  ...port,
  // Convert lat/lng to strings if they're passed as numbers
  lat: port.lat !== undefined ? String(port.lat) : undefined,
  lng: port.lng !== undefined ? String(port.lng) : undefined
}));

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

export type InsertPort = z.infer<typeof insertPortSchema>;
export type Port = typeof ports.$inferSelect;

// Refinery Port Connections
export const refineryPortConnections = mysqlTable("refinery_port_connections", {
  id: serial("id").primaryKey(),
  refineryId: int("refinery_id").notNull().references(() => refineries.id),
  portId: int("port_id").notNull().references(() => ports.id),
  distance: decimal("distance", { precision: 10, scale: 2 }), // distance in kilometers
  connectionType: varchar("connection_type", { length: 50 }).default("pipeline"), // pipeline, ship, truck, etc.
  capacity: decimal("capacity", { precision: 15, scale: 2 }), // max transfer capacity in barrels per day
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertRefineryPortConnectionSchema = createInsertSchema(refineryPortConnections).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertRefineryPortConnection = z.infer<typeof insertRefineryPortConnectionSchema>;
export type RefineryPortConnection = typeof refineryPortConnections.$inferSelect;

// Shipping Companies
export const companies = mysqlTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  headquarters: varchar("headquarters", { length: 255 }),
  foundedYear: int("founded_year"),
  ceo: varchar("ceo", { length: 255 }),
  fleetSize: int("fleet_size"),
  specialization: varchar("specialization", { length: 100 }), // e.g., Crude Oil, LNG, Products
  website: varchar("website", { length: 255 }),
  logo: varchar("logo", { length: 255 }), // URL to company logo
  description: varchar("description", { length: 1000 }),
  revenue: decimal("revenue", { precision: 15, scale: 2 }), // Revenue in millions
  employees: int("employees"),
  publiclyTraded: boolean("publicly_traded").default(false),
  stockSymbol: varchar("stock_symbol", { length: 20 }),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Subscription Plans
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 1000 }).notNull(),
  monthlyPriceId: varchar("monthly_price_id", { length: 255 }).notNull(), // Stripe price ID for monthly billing
  yearlyPriceId: varchar("yearly_price_id", { length: 255 }).notNull(), // Stripe price ID for yearly billing
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("usd"),
  features: varchar("features", { length: 2000 }).notNull(), // JSON array of features as a string
  isPopular: boolean("is_popular").default(false),
  trialDays: int("trial_days").default(0),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Subscriptions (to track user subscriptions)
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  planId: int("plan_id").notNull().references(() => subscriptionPlans.id),
  status: varchar("status", { length: 50 }).notNull(), // 'active', 'canceled', 'past_due', 'trialing', etc.
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  billingInterval: varchar("billing_interval", { length: 20 }).notNull().default("month"), // 'month' or 'year'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Customer payment methods
export const paymentMethods = mysqlTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'card', 'bank_account', etc.
  brand: varchar("brand", { length: 50 }), // 'visa', 'mastercard', etc.
  last4: varchar("last4", { length: 4 }), // Last 4 digits of card or bank account
  expiryMonth: int("expiry_month"), // For cards
  expiryYear: int("expiry_year"), // For cards
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Invoices
export const invoices = mysqlTable("invoices", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  subscriptionId: int("subscription_id").references(() => subscriptions.id),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("usd"),
  status: varchar("status", { length: 50 }).notNull(), // 'paid', 'open', 'void', etc.
  billingReason: varchar("billing_reason", { length: 100 }), // 'subscription_create', 'subscription_cycle', etc.
  invoiceDate: timestamp("invoice_date").notNull(),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  pdfUrl: varchar("pdf_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
