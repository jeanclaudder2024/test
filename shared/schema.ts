import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal, primaryKey, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Free Trial", "Basic", "Pro", "Enterprise", "Broker"
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }),
  yearlyPrice: decimal("yearlyPrice", { precision: 10, scale: 2 }),
  interval: text("interval").notNull().default("month"), // "month", "year"
  trialDays: integer("trial_days").default(3),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").notNull().default(true),
  features: jsonb("features"), // JSON array of feature names
  maxVessels: integer("max_vessels").default(-1), // -1 = unlimited
  maxPorts: integer("max_ports").default(-1),
  maxRefineries: integer("max_refineries").default(-1),
  canAccessBrokerFeatures: boolean("can_access_broker_features").default(false),
  canAccessAnalytics: boolean("can_access_analytics").default(false),
  canExportData: boolean("can_export_data").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"), // Optional for OAuth users
  firstName: text("first_name"),
  lastName: text("last_name"),
  username: text("username"),
  role: text("role").notNull().default("user"), // 'admin', 'user', 'broker'
  stripeCustomerId: text("stripe_customer_id"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  lastLoginAt: timestamp("last_login_at"),
  // OAuth fields
  googleId: text("google_id"),
  avatarUrl: text("avatar_url"),
  provider: text("provider").default("email"), // 'email', 'google'
  // Enhanced Profile Fields
  phoneNumber: text("phone_number"),
  company: text("company"),
  jobTitle: text("job_title"),
  country: text("country"),
  timezone: text("timezone"),
  bio: text("bio"),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  twitterHandle: text("twitter_handle"),
  // Preferences
  emailNotifications: boolean("email_notifications").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  weeklyReports: boolean("weekly_reports").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  // Profile completion tracking
  profileCompleteness: integer("profile_completeness").default(0), // 0-100
  onboardingCompleted: boolean("onboarding_completed").default(false),
  // Broker membership (separate from subscription plans)
  hasBrokerMembership: boolean("has_broker_membership").default(false),
  brokerMembershipDate: timestamp("broker_membership_date"),
  brokerMembershipPaymentId: text("broker_membership_payment_id"),
  // Payment method for subscription auto-renewal
  stripePaymentMethodId: text("stripe_payment_method_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("trial"), // "trial", "active", "canceled", "past_due", "unpaid"
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment history
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(), // "succeeded", "failed", "pending"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Landing Page Content Management
export const landingPageContent = pgTable("landing_page_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull().unique(), // 'hero', 'features', 'pricing', 'about', 'stats'
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  content: jsonb("content"), // For flexible content storage
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").default(0),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const landingPageContentRelations = relations(landingPageContent, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [landingPageContent.updatedBy],
    references: [users.id],
  }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(userSubscriptions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(userSubscriptions, {
    fields: [users.id],
    references: [userSubscriptions.userId],
  }),
  payments: many(payments),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [userSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  subscription: one(userSubscriptions, {
    fields: [payments.subscriptionId],
    references: [userSubscriptions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  googleId: true,
  avatarUrl: true,
  provider: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  trialStartDate: true,
  trialEndDate: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// SubscriptionPlan type with pricing fields for frontend
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect & {
  monthlyPrice?: number;
  yearlyPrice?: number;
  isPopular?: boolean;
};
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

// Register schema with validation
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  planId: z.number().optional(), // Optional plan ID for subscription selection
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Resend verification schema
export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Vessels
export const vessels = pgTable("vessels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imo: text("imo").notNull().unique(),
  mmsi: text("mmsi").notNull(),
  vesselType: text("vessel_type").notNull(),
  flag: text("flag").notNull(),
  built: integer("built"),
  deadweight: integer("deadweight"),
  currentLat: decimal("current_lat", { precision: 10, scale: 6 }),
  currentLng: decimal("current_lng", { precision: 10, scale: 6 }),
  departurePort: integer("departure_port"),
  departureDate: timestamp("departure_date"),
  departureLat: decimal("departure_lat", { precision: 10, scale: 6 }),
  departureLng: decimal("departure_lng", { precision: 10, scale: 6 }),
  destinationPort: integer("destination_port"), // References ports(id)
  destinationLat: decimal("destination_lat", { precision: 10, scale: 6 }),
  destinationLng: decimal("destination_lng", { precision: 10, scale: 6 }),  
  eta: timestamp("eta"),
  cargoType: text("cargo_type"),
  cargoCapacity: integer("cargo_capacity"),
  currentRegion: text("current_region"),
  status: text("status").default("underway"), // idle, underway, at port, near refinery, etc.
  speed: text("speed"), // in knots
  buyerName: text("buyer_name").default("NA"),
  sellerName: text("seller_name"),
  ownerName: text("owner_name"), // Oil company that owns the vessel
  operatorName: text("operator_name"), // Oil company that operates the vessel
  oilSource: text("oil_source"), // Which company/refinery the vessel is taking oil from
  
  // Deal Information Fields
  oilType: text("oil_type"), // Type of oil/cargo
  quantity: decimal("quantity", { precision: 15, scale: 2 }), // Quantity in barrels/tons
  dealValue: decimal("deal_value", { precision: 15, scale: 2 }), // Value in USD
  loadingPort: text("loading_port"), // Port where cargo is loaded
  price: decimal("price", { precision: 15, scale: 2 }), // Price per barrel/ton
  marketPrice: decimal("market_price", { precision: 15, scale: 2 }), // Current market price
  sourceCompany: text("source_company"), // Source company name
  targetRefinery: text("target_refinery"), // Target refinery name
  shippingType: text("shipping_type"), // FOB, In Tank, CIF, etc.
  
  // Route information
  routeDistance: decimal("route_distance", { precision: 10, scale: 2 }), // Distance in nautical miles
  
  // Enhanced vessel technical specifications
  callsign: text("callsign"), // Radio callsign
  course: integer("course"), // Heading in degrees (0-360)
  navStatus: text("nav_status"), // Navigation status from AIS
  draught: decimal("draught", { precision: 5, scale: 2 }), // Current draught in meters
  length: decimal("length", { precision: 8, scale: 2 }), // Vessel length in meters
  width: decimal("width", { precision: 6, scale: 2 }), // Vessel width in meters
  enginePower: integer("engine_power"), // Engine power in HP
  fuelConsumption: decimal("fuel_consumption", { precision: 8, scale: 2 }), // Fuel consumption tons/day
  crewSize: integer("crew_size"), // Number of crew members
  grossTonnage: integer("gross_tonnage"), // Gross tonnage
  
  metadata: text("metadata"), // JSON string with additional vessel information (heading, speed, course, etc.)
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertVesselSchema = createInsertSchema(vessels).omit({
  id: true,
  lastUpdated: true,
}).extend({
  // Make coordinate fields accept strings and convert them
  currentLat: z.string().optional(),
  currentLng: z.string().optional(),
  departureLat: z.string().optional(),
  departureLng: z.string().optional(),
  destinationLat: z.string().optional(),
  destinationLng: z.string().optional(),
  // Allow string input for timestamps
  departureDate: z.string().optional(),
  eta: z.string().optional(),
  // Ensure required fields have defaults if empty
  name: z.string().min(1, "Vessel name is required"),
  imo: z.string().min(1, "IMO number is required"),
  mmsi: z.string().min(1, "MMSI number is required"),
  vesselType: z.string().min(1, "Vessel type is required"),
  flag: z.string().min(1, "Flag is required"),
  // Allow numeric fields to be strings and convert them
  built: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  deadweight: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  cargoCapacity: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  // Deal information fields validation
  quantity: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  dealValue: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  price: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  marketPrice: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  routeDistance: z.union([z.number(), z.string()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  })
});

// Refineries - Minimal schema matching existing Supabase table
export const refineries = pgTable("refineries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  capacity: integer("capacity"),
  status: text("status").default("active"),
  description: text("description"),
  operator: text("operator"),
  owner: text("owner"),
  type: text("type"),
  products: text("products"),
  year_built: integer("year_built"),
  last_maintenance: timestamp("last_maintenance"),
  next_maintenance: timestamp("next_maintenance"),
  complexity: text("complexity"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  technical_specs: text("technical_specs"),
  photo: text("photo"),
  city: text("city"),
  last_updated: timestamp("last_updated"),
  utilization: text("utilization"),
  
  // Technical Specifications
  distillation_capacity: text("distillation_capacity"),
  conversion_capacity: text("conversion_capacity"),
  hydrogen_capacity: text("hydrogen_capacity"),
  sulfur_recovery: text("sulfur_recovery"),
  processing_units: text("processing_units"),
  storage_capacity: text("storage_capacity"),
  
  // Financial Information
  investment_cost: text("investment_cost"),
  operating_costs: text("operating_costs"),
  revenue: text("revenue"),
  profit_margin: text("profit_margin"),
  market_share: text("market_share"),
  
  // Compliance & Regulations
  environmental_certifications: text("environmental_certifications"),
  safety_record: text("safety_record"),
  workforce_size: integer("workforce_size"),
  annual_throughput: text("annual_throughput"),
  crude_oil_sources: text("crude_oil_sources"),
  
  // Strategic Information
  pipeline_connections: text("pipeline_connections"),
  shipping_terminals: text("shipping_terminals"),
  rail_connections: text("rail_connections"),
  nearest_port: text("nearest_port"),
  
  // Additional Fields
  fuel_types: text("fuel_types"),
  refinery_complexity: text("refinery_complexity"),
  daily_throughput: integer("daily_throughput"),
  annual_revenue: text("annual_revenue"),
  employees_count: integer("employees_count"),
  established_year: integer("established_year"),
  parent_company: text("parent_company"),
  safety_rating: text("safety_rating"),
  environmental_rating: text("environmental_rating"),
  production_capacity: integer("production_capacity"),
  maintenance_schedule: text("maintenance_schedule"),
  certifications: text("certifications"),
  compliance_status: text("compliance_status"),
  market_position: text("market_position"),
  strategic_partnerships: text("strategic_partnerships"),
  expansion_plans: text("expansion_plans"),
  technology_upgrades: text("technology_upgrades"),
  operational_efficiency: text("operational_efficiency"),
  supply_chain_partners: text("supply_chain_partners"),
  distribution_network: text("distribution_network")
});

export const insertRefinerySchema = createInsertSchema(refineries).omit({
  id: true,
});



// Progress Events
export const progressEvents = pgTable("progress_events", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull(),
  date: timestamp("date").notNull(),
  event: text("event").notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }),
  lng: decimal("lng", { precision: 10, scale: 6 }),
  location: text("location"),
});

export const insertProgressEventSchema = createInsertSchema(progressEvents).omit({
  id: true,
});



// Brokers
export const brokers = pgTable("brokers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country"),
  active: boolean("active").default(true),
  
  // Elite Membership fields
  eliteMember: boolean("elite_member").default(false),
  eliteMemberSince: timestamp("elite_member_since"),
  eliteMemberExpires: timestamp("elite_member_expires"),
  membershipId: text("membership_id"),
  
  // Additional contact and subscription information
  shippingAddress: text("shipping_address"),
  subscriptionPlan: text("subscription_plan"),
  lastLogin: timestamp("last_login"),
});

export const insertBrokerSchema = createInsertSchema(brokers).omit({
  id: true,
});

// Stats
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

// Oil Types Management - Comprehensive version with description and full maritime data
export const oilTypes = pgTable("oil_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Technical name: brent_crude, wti, etc.
  displayName: text("display_name").notNull(), // Human readable: Brent Crude Oil, West Texas Intermediate
  category: text("category").notNull(), // crude, refined, lng, lpg, petrochemical, other
  apiGravity: decimal("api_gravity", { precision: 5, scale: 2 }), // API gravity
  sulfurContent: decimal("sulfur_content", { precision: 5, scale: 3 }), // Sulfur percentage
  viscosity: decimal("viscosity", { precision: 8, scale: 2 }), // Viscosity in cSt
  density: decimal("density", { precision: 8, scale: 4 }), // Density in kg/m³
  flashPoint: integer("flash_point"), // Flash point in Celsius
  pourPoint: integer("pour_point"), // Pour point in Celsius
  marketPrice: decimal("market_price", { precision: 10, scale: 2 }), // USD per barrel/ton
  priceUnit: text("price_unit").default("barrel"), // barrel, ton, gallon, mmbtu
  description: text("description"), // Detailed description field
  commonUses: text("common_uses"), // JSON array of uses
  majorProducers: text("major_producers"), // JSON array of countries/companies
  tradingSymbol: text("trading_symbol"), // WTI, BRENT, etc.
  hsCode: text("hs_code"), // Harmonized System code for customs
  unClass: text("un_class"), // UN classification for hazardous materials
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertOilTypeSchema = createInsertSchema(oilTypes).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Type Exports

export type InsertVessel = z.infer<typeof insertVesselSchema>;
export type Vessel = typeof vessels.$inferSelect;

export type InsertRefinery = z.infer<typeof insertRefinerySchema>;
export type Refinery = typeof refineries.$inferSelect;

export type InsertProgressEvent = z.infer<typeof insertProgressEventSchema>;
export type ProgressEvent = typeof progressEvents.$inferSelect;



export type InsertBroker = z.infer<typeof insertBrokerSchema>;
export type Broker = typeof brokers.$inferSelect;

export type InsertOilType = z.infer<typeof insertOilTypeSchema>;
export type OilType = typeof oilTypes.$inferSelect;

// Real Companies - Professional data entered by admin
export const realCompanies = pgTable("real_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull().default("Oil"),
  address: text("address").notNull(),
  logo: text("logo"), // URL or file path
  description: text("description").notNull(),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  founded: integer("founded"),
  employees: integer("employees"),
  revenue: text("revenue"), // e.g., "$100M - $500M"
  headquarters: text("headquarters"),
  ceo: text("ceo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fake Companies - Auto-generated and linked to Real Companies
export const fakeCompanies = pgTable("fake_companies", {
  id: serial("id").primaryKey(),
  realCompanyId: integer("real_company_id").notNull().references(() => realCompanies.id),
  generatedName: text("generated_name").notNull(), // Auto-generated fake name
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
  
  // Contact Information
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  postalCode: text("postal_code"),
  
  // Technical Specifications
  maxVesselLength: decimal("max_vessel_length", { precision: 8, scale: 2 }), // in meters
  maxVesselBeam: decimal("max_vessel_beam", { precision: 6, scale: 2 }), // in meters
  maxDraught: decimal("max_draught", { precision: 5, scale: 2 }), // in meters
  maxDeadweight: integer("max_deadweight"), // maximum deadweight tonnage
  berthCount: integer("berth_count"), // number of berths
  terminalCount: integer("terminal_count"), // number of terminals
  
  // Water Depth & Navigation
  channelDepth: decimal("channel_depth", { precision: 5, scale: 2 }), // in meters
  berthDepth: decimal("berth_depth", { precision: 5, scale: 2 }), // in meters
  anchorageDepth: decimal("anchorage_depth", { precision: 5, scale: 2 }), // in meters
  
  // Services & Facilities
  services: text("services"), // JSON array: ["pilotage", "tugboats", "bunker", "repair", "waste_disposal"]
  facilities: text("facilities"), // JSON array: ["crane", "warehouse", "cold_storage", "oil_terminal"]
  cargoTypes: text("cargo_types"), // JSON array: ["container", "bulk", "oil", "gas", "general"]
  
  // Safety & Security
  securityLevel: text("security_level"), // ISPS security level: 1, 2, or 3
  pilotageRequired: boolean("pilotage_required").default(false),
  tugAssistance: boolean("tug_assistance").default(false),
  quarantineStation: boolean("quarantine_station").default(false),
  
  // Environmental & Regulatory
  environmentalCertifications: text("environmental_certifications"), // JSON array
  customsOffice: boolean("customs_office").default(false),
  freeTradeZone: boolean("free_trade_zone").default(false),
  
  // Infrastructure
  railConnection: boolean("rail_connection").default(false),
  roadConnection: boolean("road_connection").default(true),
  airportDistance: decimal("airport_distance", { precision: 8, scale: 2 }), // distance to nearest airport in km
  
  // Weather & Conditions
  averageWaitTime: decimal("average_wait_time", { precision: 5, scale: 2 }), // in hours
  weatherRestrictions: text("weather_restrictions"),
  tidalRange: decimal("tidal_range", { precision: 4, scale: 2 }), // in meters
  
  // Economic Information
  portCharges: text("port_charges"), // JSON object with fee structure
  currency: text("currency").default("USD"),
  
  // Connectivity
  connectedRefineries: integer("connected_refineries").default(0),
  nearbyPorts: text("nearby_ports"), // JSON array of port IDs within proximity
  
  // Statistics
  vesselCount: integer("vessel_count").default(0), // current vessels at port
  totalCargo: decimal("total_cargo", { precision: 15, scale: 2 }).default("0"), // current cargo volume
  
  // Metadata
  established: integer("established"), // year established
  lastInspection: timestamp("last_inspection"),
  nextInspection: timestamp("next_inspection"),
  photo: text("photo"), // URL to port photo
  
  // System fields
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertPortSchema = createInsertSchema(ports).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
  vesselCount: true,
  totalCargo: true,
  connectedRefineries: true,
}).extend({
  // Required fields with proper validation
  name: z.string().min(1, "Port name is required"),
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  
  // Geographic coordinates with proper decimal transformation - REQUIRED fields
  lat: z.union([z.string(), z.number()]).refine(val => {
    if (val === "" || val === null || val === undefined) return false;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return !isNaN(num) && num >= -90 && num <= 90;
  }, { message: "Valid latitude is required (-90 to 90)" }).transform(val => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return num.toString(); // Convert to string for decimal storage
  }),
  lng: z.union([z.string(), z.number()]).refine(val => {
    if (val === "" || val === null || val === undefined) return false;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return !isNaN(num) && num >= -180 && num <= 180;
  }, { message: "Valid longitude is required (-180 to 180)" }).transform(val => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return num.toString(); // Convert to string for decimal storage
  }),
  
  // Optional string fields
  city: z.string().optional(),
  timezone: z.string().optional(),
  description: z.string().optional(),
  portAuthority: z.string().optional(),
  operator: z.string().optional(),
  owner: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  operatingHours: z.string().optional(),
  weatherRestrictions: z.string().optional(),
  
  // Numeric fields with transformation
  capacity: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  annualThroughput: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  maxDeadweight: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  berthCount: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  terminalCount: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  established: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }),
  
  // Decimal fields with transformation
  maxVesselLength: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  maxVesselBeam: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  maxDraught: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  channelDepth: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  berthDepth: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  anchorageDepth: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  airportDistance: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  averageWaitTime: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  tidalRange: z.union([z.number(), z.string(), z.undefined()]).optional().transform(val => {
    if (val === "" || val === null || val === undefined) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? null : String(num);
  }),
  
  // Boolean fields
  pilotageRequired: z.boolean().optional(),
  tugAssistance: z.boolean().optional(),
  quarantineStation: z.boolean().optional(),
  customsOffice: z.boolean().optional(),
  freeTradeZone: z.boolean().optional(),
  railConnection: z.boolean().optional(),
  roadConnection: z.boolean().optional(),
  
  // JSON array fields (stored as text) - accept strings only
  services: z.string().optional().nullable(),
  facilities: z.string().optional().nullable(),
  cargoTypes: z.string().optional().nullable(),
  environmentalCertifications: z.string().optional().nullable(),
  nearbyPorts: z.union([z.string(), z.array(z.string())]).optional().transform(val => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    return JSON.stringify(val);
  }),
  
  // Optional date fields
  lastInspection: z.string().optional(),
  nextInspection: z.string().optional(),
});

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

export type InsertPort = z.infer<typeof insertPortSchema>;
export type Port = typeof ports.$inferSelect;

// Vessel-Port Connections
export const vesselPortConnections = pgTable("vessel_port_connections", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull().references(() => vessels.id, { onDelete: "cascade" }),
  portId: integer("port_id").notNull().references(() => ports.id, { onDelete: "cascade" }),
  connectionType: text("connection_type").notNull(), // 'departure', 'arrival', 'nearby'
  distance: decimal("distance", { precision: 10, scale: 2 }), // distance in kilometers
  estimatedTime: timestamp("estimated_time"), // ETA or ETD
  status: text("status").default("active"), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertVesselPortConnectionSchema = createInsertSchema(vesselPortConnections).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertVesselPortConnection = z.infer<typeof insertVesselPortConnectionSchema>;
export type VesselPortConnection = typeof vesselPortConnections.$inferSelect;

// Refinery Port Connections
export const refineryPortConnections = pgTable("refinery_port_connections", {
  id: serial("id").primaryKey(),
  refineryId: integer("refinery_id").notNull().references(() => refineries.id),
  portId: integer("port_id").notNull().references(() => ports.id),
  distance: decimal("distance", { precision: 10, scale: 2 }), // distance in kilometers
  connectionType: text("connection_type").default("pipeline"), // pipeline, ship, truck, etc.
  capacity: decimal("capacity", { precision: 15, scale: 2 }), // max transfer capacity in barrels per day
  status: text("status").default("active"),
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

// Vessel Refinery Connections
export const vesselRefineryConnections = pgTable("vessel_refinery_connections", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull().references(() => vessels.id),
  refineryId: integer("refinery_id").notNull().references(() => refineries.id),
  status: text("status").default("active"), // active, scheduled, completed, cancelled
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  connectionType: text("connection_type").default("loading"), // loading, unloading, docked
  cargoVolume: decimal("cargo_volume", { precision: 15, scale: 2 }), // volume in barrels
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertVesselRefineryConnectionSchema = createInsertSchema(vesselRefineryConnections).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
}).extend({
  // Allow string input for dates
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type InsertVesselRefineryConnection = z.infer<typeof insertVesselRefineryConnectionSchema>;
export type VesselRefineryConnection = typeof vesselRefineryConnections.$inferSelect;

// Shipping Companies - simplified to match existing database
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country"),
  region: text("region"),
  website: text("website"),
  description: text("description"),
  
  // New fields for Real/Fake company system that will be added via SQL
  companyType: text("company_type"),
  linkedCompanyId: integer("linked_company_id"),
  isVisibleToBrokers: boolean("is_visible_to_brokers"),
  publiclyTraded: boolean("publicly_traded"),
  stockSymbol: text("stock_symbol"),
  revenue: decimal("revenue", { precision: 15, scale: 2 }),
  employees: integer("employees"),
  foundedYear: integer("founded_year"),
  ceo: text("ceo"),
  fleetSize: integer("fleet_size"),
  specialization: text("specialization"),
  logo: text("logo"),
  
  createdAt: timestamp("created_at"),
  lastUpdated: timestamp("last_updated"),
});

// Company relations
export const companyRelations = relations(companies, ({ one, many }) => ({
  linkedCompany: one(companies, {
    fields: [companies.linkedCompanyId],
    references: [companies.id],
  }),
  fakeCompanies: many(companies),
  deals: many(deals),
}));

// Deal requests between brokers and fake companies
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").references(() => users.id),
  fakeCompanyId: integer("fake_company_id").references(() => companies.id),
  realCompanyId: integer("real_company_id").references(() => companies.id),
  dealType: text("deal_type").notNull(), // "negotiation", "contract", "information_request"
  status: text("status").default("pending"), // "pending", "approved", "rejected", "completed"
  title: text("title").notNull(),
  description: text("description"),
  requestedVolume: decimal("requested_volume", { precision: 15, scale: 2 }),
  requestedPrice: decimal("requested_price", { precision: 15, scale: 2 }),
  dealValue: decimal("deal_value", { precision: 15, scale: 2 }),
  notes: text("notes"),
  adminNotes: text("admin_notes"), // Internal admin notes
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Documents sent to brokers after deal approval
export const dealDocuments = pgTable("deal_documents", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").references(() => deals.id),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  filePath: text("file_path").notNull(),
  documentType: text("document_type"), // "contract", "info_sheet", "agreement", "specification"
  uploadedBy: integer("uploaded_by").references(() => users.id),
  sentToBroker: boolean("sent_to_broker").default(false),
  sentAt: timestamp("sent_at"),
  downloadedBy: integer("downloaded_by").references(() => users.id),
  downloadedAt: timestamp("downloaded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Broker notifications
export const brokerNotifications = pgTable("broker_notifications", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").references(() => users.id),
  dealId: integer("deal_id").references(() => deals.id),
  documentId: integer("document_id").references(() => dealDocuments.id),
  type: text("type").notNull(), // "deal_approved", "deal_rejected", "document_received"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vesselDocuments = pgTable("vessel_documents", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").references(() => vessels.id),
  documentType: text("document_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  version: text("version").default("1.0"),
  status: text("status").default("draft"), // 'draft', 'active', 'archived'
  isRequired: boolean("is_required").default(false),
  expiryDate: timestamp("expiry_date"),
  createdBy: text("created_by"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  tags: text("tags"),
  metadata: text("metadata"),
  // isActive: boolean("is_active").default(true), // Temporarily commented out due to database schema mismatch
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Landing page content schema will be defined later

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
}).extend({
  companyType: z.enum(["real", "fake"]),
  linkedCompanyId: z.number().optional(),
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  approvedAt: true,
  completedAt: true,
  realCompanyId: true,
  approvedBy: true,
});

export const insertDealDocumentSchema = createInsertSchema(dealDocuments).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  downloadedAt: true,
});

export const insertBrokerNotificationSchema = createInsertSchema(brokerNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertVesselDocumentSchema = createInsertSchema(vesselDocuments).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  approvedAt: true,
});

export type InsertVesselDocument = z.infer<typeof insertVesselDocumentSchema>;
export type SelectVesselDocument = typeof vesselDocuments.$inferSelect;



// Landing page types will be defined later

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type DealDocument = typeof dealDocuments.$inferSelect;
export type InsertDealDocument = z.infer<typeof insertDealDocumentSchema>;
export type BrokerNotification = typeof brokerNotifications.$inferSelect;
export type InsertBrokerNotification = z.infer<typeof insertBrokerNotificationSchema>;

// Maritime Document Management System
export const maritimeDocuments = pgTable("maritime_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  documentType: text("document_type").notNull(),
  category: text("category").notNull().default("general"),
  status: text("status").notNull().default("active"),
  tags: text("tags"),
  isTemplate: boolean("is_template").default(false),
  isPublic: boolean("is_public").default(true),
  fileName: text("file_name"),
  filePath: text("file_path"),
  fileSize: text("file_size"),
  mimeType: text("mime_type"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMaritimeDocumentSchema = createInsertSchema(maritimeDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MaritimeDocument = typeof maritimeDocuments.$inferSelect;
export type InsertMaritimeDocument = z.infer<typeof insertMaritimeDocumentSchema>;

// Documents Table for Admin Document Management with Vessel Association
export const adminDocuments = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  documentType: text("document_type").notNull(),
  status: text("status").notNull().default("draft"),
  category: text("category").notNull().default("general"),
  tags: text("tags"),
  isTemplate: boolean("is_template").default(false),
  isActive: boolean("is_active").default(true),
  vesselId: integer("vessel_id").references(() => vessels.id), // Optional vessel association
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminDocumentSchema = createInsertSchema(adminDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AdminDocument = typeof adminDocuments.$inferSelect;
export type InsertAdminDocument = z.infer<typeof insertAdminDocumentSchema>;

// Document Templates Table - AI-powered templates for dynamic document generation
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Template name (e.g., "Vessel Certificate", "Safety Report")
  description: text("description").notNull(), // Description of the template
  category: text("category").notNull().default("general"), // general, technical, safety, commercial
  prompt: text("prompt").notNull(), // AI prompt describing what document to generate
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  // Access Control Fields
  adminOnly: boolean("admin_only").default(false), // Only admin can generate
  brokerOnly: boolean("broker_only").default(false), // Only broker members can generate
  basicAccess: boolean("basic_access").default(true), // Basic plan can generate
  professionalAccess: boolean("professional_access").default(true), // Professional plan can generate
  enterpriseAccess: boolean("enterprise_access").default(true), // Enterprise plan can generate
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;

// Generated Documents Table - AI-generated documents from templates
export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => documentTemplates.id),
  vesselId: integer("vessel_id").notNull().references(() => vessels.id),
  title: text("title").notNull(),
  content: text("content").notNull(), // AI-generated content
  status: text("status").notNull().default("generated"), // generated, approved, archived
  generatedBy: integer("generated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type InsertGeneratedDocument = z.infer<typeof insertGeneratedDocumentSchema>;

// Broker Companies (intermediary companies users connect to)
export const brokerCompanies = pgTable("broker_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country"),
  region: text("region"),
  headquarters: text("headquarters"),
  foundedYear: integer("founded_year"),
  ceo: text("ceo"),
  specialization: text("specialization"),
  website: text("website"),
  logo: text("logo"),
  description: text("description"),
  employees: integer("employees"),
  status: text("status").default("active"),
  connectionFee: decimal("connection_fee", { precision: 10, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // percentage
  minimumDealSize: decimal("minimum_deal_size", { precision: 15, scale: 2 }),
  verificationStatus: text("verification_status").default("verified"), // verified, pending, unverified
  rating: decimal("rating", { precision: 3, scale: 2 }), // 1.00 to 5.00
  totalDeals: integer("total_deals").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Company Partnerships (broker companies partnered with real oil companies)
export const companyPartnerships = pgTable("company_partnerships", {
  id: serial("id").primaryKey(),
  brokerCompanyId: integer("broker_company_id").references(() => brokerCompanies.id),
  realCompanyId: integer("real_company_id").references(() => companies.id),
  partnershipType: text("partnership_type"), // exclusive, preferred, standard
  dealAccess: text("deal_access"), // crude_oil, refined_products, lng, all
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  preferredTerms: text("preferred_terms"),
  status: text("status").default("active"),
  establishedDate: timestamp("established_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// User-Broker Connections (users connected to broker companies)
export const userBrokerConnections = pgTable("user_broker_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  brokerCompanyId: integer("broker_company_id").references(() => brokerCompanies.id),
  connectionStatus: text("connection_status").default("pending"), // pending, active, suspended, terminated
  connectionDate: timestamp("connection_date").defaultNow(),
  contractTerms: text("contract_terms"),
  creditAllocation: decimal("credit_allocation", { precision: 15, scale: 2 }),
  dealCount: integer("deal_count").default(0),
  totalVolume: decimal("total_volume", { precision: 15, scale: 2 }).default("0"),
  lastActivity: timestamp("last_activity").defaultNow(),
  notes: text("notes"),
});

export const insertBrokerCompanySchema = createInsertSchema(brokerCompanies).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertCompanyPartnershipSchema = createInsertSchema(companyPartnerships).omit({
  id: true,
  establishedDate: true,
  lastUpdated: true,
});

export const insertUserBrokerConnectionSchema = createInsertSchema(userBrokerConnections).omit({
  id: true,
  connectionDate: true,
  lastActivity: true,
});

export type BrokerCompany = typeof brokerCompanies.$inferSelect;
export type InsertBrokerCompany = z.infer<typeof insertBrokerCompanySchema>;
export type CompanyPartnership = typeof companyPartnerships.$inferSelect;
export type InsertCompanyPartnership = z.infer<typeof insertCompanyPartnershipSchema>;
export type UserBrokerConnection = typeof userBrokerConnections.$inferSelect;
export type InsertUserBrokerConnection = z.infer<typeof insertUserBrokerConnectionSchema>;



// Professional Document Management System
export const professionalDocuments = pgTable("professional_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"), // AI-generated content
  pdfPath: text("pdf_path"), // Path to generated PDF file
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vesselDocumentAssociations = pgTable("vessel_document_associations", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull().references(() => vessels.id),
  documentId: integer("document_id").notNull().references(() => professionalDocuments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfessionalDocumentSchema = createInsertSchema(professionalDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVesselDocumentAssociationSchema = createInsertSchema(vesselDocumentAssociations).omit({
  id: true,
  createdAt: true,
});

export type ProfessionalDocument = typeof professionalDocuments.$inferSelect;
export type InsertProfessionalDocument = z.infer<typeof insertProfessionalDocumentSchema>;
export type VesselDocumentAssociation = typeof vesselDocumentAssociations.$inferSelect;
export type InsertVesselDocumentAssociation = z.infer<typeof insertVesselDocumentAssociationSchema>;



// Subscriptions (to track user subscriptions)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull(), // 'active', 'canceled', 'past_due', 'trialing', etc.
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  billingInterval: text("billing_interval").notNull().default("month"), // 'month' or 'year'
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

// Removed old landing page content schema - replaced with comprehensive system below

// Customer payment methods
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull(),
  type: text("type").notNull(), // 'card', 'bank_account', etc.
  brand: text("brand"), // 'visa', 'mastercard', etc.
  last4: text("last4"), // Last 4 digits of card or bank account
  expiryMonth: integer("expiry_month"), // For cards
  expiryYear: integer("expiry_year"), // For cards
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

// Landing Page Content schemas
export const insertLandingPageContentSchema = createInsertSchema(landingPageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LandingPageContent = typeof landingPageContent.$inferSelect;
export type InsertLandingPageContent = z.infer<typeof insertLandingPageContentSchema>;

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  stripeInvoiceId: text("stripe_invoice_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("usd"),
  status: text("status").notNull(), // 'paid', 'open', 'void', etc.
  billingReason: text("billing_reason"), // 'subscription_create', 'subscription_cycle', etc.
  invoiceDate: timestamp("invoice_date").notNull(),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  pdfUrl: text("pdf_url"),
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

// Gate (بوابة)
export const gates = pgTable("gates", {
  id: serial("id").primaryKey(),
  portId: integer("port_id").notNull().references(() => ports.id),
  name: text("name").notNull(),
  number: text("number").notNull(),
  status: text("status").default("active").notNull(), // active, maintenance, closed
  type: text("type").default("cargo").notNull(), // cargo, passenger, mixed
  capacity: integer("capacity"), // vessels per day
  currentOccupancy: integer("current_occupancy").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertGateSchema = createInsertSchema(gates).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertGate = z.infer<typeof insertGateSchema>;
export type Gate = typeof gates.$inferSelect;

// Assigned Job (عمل محدد للسفينة)
export const vesselJobs = pgTable("vessel_jobs", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull().references(() => vessels.id),
  jobType: text("job_type").notNull(), // loading, unloading, maintenance, waiting
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  gateId: integer("gate_id").references(() => gates.id),
  brokerId: integer("broker_id").references(() => brokers.id),
  companyId: integer("company_id").references(() => companies.id),
  startTime: timestamp("start_time"),
  estimatedEndTime: timestamp("estimated_end_time"),
  actualEndTime: timestamp("actual_end_time"),
  cargoDetails: text("cargo_details"), // JSON string with cargo information
  unloadingProgress: decimal("unloading_progress", { precision: 5, scale: 2 }).default("0"), // Percentage of completion (0-100)
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  notes: text("notes"),
});

export const insertVesselJobSchema = createInsertSchema(vesselJobs).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertVesselJob = z.infer<typeof insertVesselJobSchema>;
export type VesselJob = typeof vesselJobs.$inferSelect;

// Update the vessels table to add relation to job status
export const vesselExtraInfo = pgTable("vessel_extra_info", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull().references(() => vessels.id).unique(),
  currentJobId: integer("current_job_id").references(() => vesselJobs.id),
  currentGateId: integer("current_gate_id").references(() => gates.id),
  loadingStatus: text("loading_status").default("waiting"), // waiting, loading, unloading, completed
  colorCode: text("color_code").default("blue"), // blue=waiting, red=unloading, green=completed
  lastStatusChange: timestamp("last_status_change").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertVesselExtraInfoSchema = createInsertSchema(vesselExtraInfo).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
  lastStatusChange: true,
});

export type InsertVesselExtraInfo = z.infer<typeof insertVesselExtraInfoSchema>;
export type VesselExtraInfo = typeof vesselExtraInfo.$inferSelect;

// Define relations
export const vesselsRelations = relations(vessels, ({ many, one }) => ({
  currentJobs: many(vesselJobs),
  extraInfo: one(vesselExtraInfo, {
    fields: [vessels.id],
    references: [vesselExtraInfo.vesselId],
  }),
}));

export const vesselJobsRelations = relations(vesselJobs, ({ one }) => ({
  vessel: one(vessels, {
    fields: [vesselJobs.vesselId],
    references: [vessels.id],
  }),
  gate: one(gates, {
    fields: [vesselJobs.gateId],
    references: [gates.id],
  }),
  broker: one(brokers, {
    fields: [vesselJobs.brokerId],
    references: [brokers.id],
  }),
}));

export const vesselExtraInfoRelations = relations(vesselExtraInfo, ({ one }) => ({
  vessel: one(vessels, {
    fields: [vesselExtraInfo.vesselId],
    references: [vessels.id],
  }),
  currentJob: one(vesselJobs, {
    fields: [vesselExtraInfo.currentJobId],
    references: [vesselJobs.id],
  }),
  currentGate: one(gates, {
    fields: [vesselExtraInfo.currentGateId],
    references: [gates.id],
  }),
}));

export const gatesRelations = relations(gates, ({ many, one }) => ({
  vesselJobs: many(vesselJobs),
  port: one(ports, {
    fields: [gates.portId],
    references: [ports.id],
  }),
}));



// Landing Page Management Tables
export const landingPageSections = pgTable("landing_page_sections", {
  id: serial("id").primaryKey(),
  sectionKey: varchar("section_key", { length: 100 }).notNull().unique(),
  sectionName: varchar("section_name", { length: 255 }).notNull(),
  isEnabled: boolean("is_enabled").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



export const landingPageImages = pgTable("landing_page_images", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // Changed from sectionId to section text field
  imageKey: varchar("image_key", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  altText: varchar("alt_text", { length: 255 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true), // Added isActive field
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueImage: unique("unique_section_image").on(table.section, table.imageKey),
}));

export const landingPageBlocks = pgTable("landing_page_blocks", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => landingPageSections.id).notNull(),
  blockType: varchar("block_type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  linkText: varchar("link_text", { length: 100 }),
  metadata: text("metadata"), // JSON string for additional data
  displayOrder: integer("display_order").default(0),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLandingPageSectionSchema = createInsertSchema(landingPageSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLandingPageImageSchema = createInsertSchema(landingPageImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Broker System Tables
export const brokerDeals = pgTable("broker_deals", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerCompanyId: integer("seller_company_id"),
  buyerCompanyId: integer("buyer_company_id"),
  vesselId: integer("vessel_id").references(() => vessels.id, { onDelete: "set null" }),
  
  dealTitle: varchar("deal_title", { length: 255 }).notNull(),
  dealDescription: text("deal_description"),
  cargoType: varchar("cargo_type", { length: 100 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  quantityUnit: varchar("quantity_unit", { length: 20 }).default("MT"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  
  status: varchar("status", { length: 50 }).default("draft"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default("0.0150"),
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }),
  
  originPort: varchar("origin_port", { length: 255 }),
  destinationPort: varchar("destination_port", { length: 255 }),
  departureDate: timestamp("departure_date"),
  arrivalDate: timestamp("arrival_date"),
  
  progressPercentage: integer("progress_percentage").default(0),
  completionDate: timestamp("completion_date"),
  currentStep: integer("current_step").default(1),
  transactionType: varchar("transaction_type", { length: 50 }).default("CIF-ASWP"),
  overallProgress: decimal("overall_progress", { precision: 5, scale: 2 }).default("0.00"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  notes: text("notes"),
});

export const transactionSteps = pgTable("transaction_steps", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => brokerDeals.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  stepName: varchar("step_name", { length: 255 }).notNull(),
  stepDescription: text("step_description"),
  status: varchar("status", { length: 50 }).default("pending"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Chat system tables
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  adminId: integer("admin_id").references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).default("Support Chat"),
  status: varchar("status", { length: 50 }).default("active"),
  priority: varchar("priority", { length: 20 }).default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageText: text("message_text").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"),
  filePath: varchar("file_path", { length: 500 }),
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).default("participant"),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadMessageId: integer("last_read_message_id"),
  isActive: boolean("is_active").default(true),
});

export const transactionDocuments = pgTable("transaction_documents", {
  id: serial("id").primaryKey(),
  stepId: integer("step_id").notNull().references(() => transactionSteps.id, { onDelete: "cascade" }),
  dealId: integer("deal_id").notNull().references(() => brokerDeals.id, { onDelete: "cascade" }),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  storedFilename: varchar("stored_filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

export const dealMessages = pgTable("deal_messages", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => brokerDeals.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const dealMessageAttachments = pgTable("deal_message_attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => dealMessages.id, { onDelete: "cascade" }),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  storedFilename: varchar("stored_filename", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

export const brokerDocuments = pgTable("broker_documents", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dealId: integer("deal_id").references(() => brokerDeals.id, { onDelete: "cascade" }),
  
  documentName: varchar("document_name", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  
  description: text("description"),
  version: varchar("version", { length: 20 }).default("1.0"),
  status: varchar("status", { length: 50 }).default("active"),
  confidentialityLevel: varchar("confidentiality_level", { length: 20 }).default("standard"),
  
  uploadDate: timestamp("upload_date").defaultNow(),
  lastAccessed: timestamp("last_accessed"),
  downloadCount: integer("download_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brokerAdminFiles = pgTable("broker_admin_files", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: varchar("file_size", { length: 50 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  sentDate: timestamp("sent_date").defaultNow(),
  sentBy: varchar("sent_by", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull().default("other"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const brokerStats = pgTable("broker_stats", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  totalDeals: integer("total_deals").default(0),
  activeDeals: integer("active_deals").default(0),
  completedDeals: integer("completed_deals").default(0),
  cancelledDeals: integer("cancelled_deals").default(0),
  
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0.00"),
  totalCommission: decimal("total_commission", { precision: 15, scale: 2 }).default("0.00"),
  averageDealValue: decimal("average_deal_value", { precision: 12, scale: 2 }).default("0.00"),
  
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0.00"),
  averageDealDuration: integer("average_deal_duration").default(0),
  clientSatisfactionScore: decimal("client_satisfaction_score", { precision: 3, scale: 2 }).default("0.00"),
  
  documentsUploaded: integer("documents_uploaded").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  
  statsPeriod: varchar("stats_period", { length: 20 }).default("all_time"),
  periodStartDate: timestamp("period_start_date"),
  periodEndDate: timestamp("period_end_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const brokerProfiles = pgTable("broker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  companyName: varchar("company_name", { length: 255 }),
  jobTitle: varchar("job_title", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  yearsExperience: integer("years_experience"),
  specializations: text("specializations"),
  
  businessPhone: varchar("business_phone", { length: 50 }),
  businessEmail: varchar("business_email", { length: 255 }),
  businessAddress: text("business_address"),
  websiteUrl: varchar("website_url", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 255 }),
  
  certifications: text("certifications"),
  complianceStatus: varchar("compliance_status", { length: 50 }).default("pending"),
  lastComplianceCheck: timestamp("last_compliance_check"),
  
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalRatings: integer("total_ratings").default(0),
  verifiedBroker: boolean("verified_broker").default(false),
  premiumMember: boolean("premium_member").default(false),
  
  notificationPreferences: text("notification_preferences"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  languagePreference: varchar("language_preference", { length: 10 }).default("en"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Broker schema validation
export const insertBrokerDealSchema = createInsertSchema(brokerDeals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrokerDocumentSchema = createInsertSchema(brokerDocuments).omit({
  id: true,
  createdAt: true,
  uploadDate: true,
  downloadCount: true,
});

export const insertBrokerAdminFileSchema = createInsertSchema(brokerAdminFiles).omit({
  id: true,
  createdAt: true,
  sentDate: true,
  isRead: true,
  readAt: true,
});

export const insertBrokerStatsSchema = createInsertSchema(brokerStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrokerProfileSchema = createInsertSchema(brokerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Broker types
export type BrokerDeal = typeof brokerDeals.$inferSelect;
export type InsertBrokerDeal = z.infer<typeof insertBrokerDealSchema>;
export type BrokerDocument = typeof brokerDocuments.$inferSelect;
export type InsertBrokerDocument = z.infer<typeof insertBrokerDocumentSchema>;
export type BrokerAdminFile = typeof brokerAdminFiles.$inferSelect;
export type InsertBrokerAdminFile = z.infer<typeof insertBrokerAdminFileSchema>;
export type BrokerStats = typeof brokerStats.$inferSelect;
export type InsertBrokerStats = z.infer<typeof insertBrokerStatsSchema>;
export type BrokerProfile = typeof brokerProfiles.$inferSelect;
export type InsertBrokerProfile = z.infer<typeof insertBrokerProfileSchema>;

// Transaction Progress Schemas
export const insertTransactionStepSchema = createInsertSchema(transactionSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionDocumentSchema = createInsertSchema(transactionDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertDealMessageSchema = createInsertSchema(dealMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDealMessageAttachmentSchema = createInsertSchema(dealMessageAttachments).omit({
  id: true,
  uploadedAt: true,
});

// Transaction Progress Types
export type TransactionStep = typeof transactionSteps.$inferSelect;
export type InsertTransactionStep = z.infer<typeof insertTransactionStepSchema>;
export type TransactionDocument = typeof transactionDocuments.$inferSelect;
export type InsertTransactionDocument = z.infer<typeof insertTransactionDocumentSchema>;
export type DealMessage = typeof dealMessages.$inferSelect;
export type InsertDealMessage = z.infer<typeof insertDealMessageSchema>;
export type DealMessageAttachment = typeof dealMessageAttachments.$inferSelect;
export type InsertDealMessageAttachment = z.infer<typeof insertDealMessageAttachmentSchema>;

export const insertLandingPageBlockSchema = createInsertSchema(landingPageBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LandingPageSection = typeof landingPageSections.$inferSelect;
export type LandingPageImage = typeof landingPageImages.$inferSelect;
export type LandingPageBlock = typeof landingPageBlocks.$inferSelect;
export type InsertLandingPageSection = z.infer<typeof insertLandingPageSectionSchema>;
export type InsertLandingPageImage = z.infer<typeof insertLandingPageImageSchema>;
export type InsertLandingPageBlock = z.infer<typeof insertLandingPageBlockSchema>;

// Regions Management
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(), // APAC, EMEA, AMERICAS, etc.
  parentRegion: text("parent_region"), // For sub-regions
  countries: text("countries").notNull(), // JSON array of country codes
  majorPorts: text("major_ports"), // JSON array of port names
  majorRefineries: text("major_refineries"), // JSON array of refinery names
  timeZones: text("time_zones"), // JSON array of time zones
  primaryLanguages: text("primary_languages"), // JSON array of languages
  currencies: text("currencies"), // JSON array of currency codes
  tradingHours: text("trading_hours"), // JSON object with trading hours
  description: text("description"),
  economicProfile: text("economic_profile"), // GDP, oil consumption, etc.
  regulatoryFramework: text("regulatory_framework"), // Key regulations
  marketCharacteristics: text("market_characteristics"), // Spot vs contract markets
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

// Broker Card Applications
export const brokerCardApplications = pgTable("broker_card_applications", {
  id: serial("id").primaryKey(),
  submittedBy: integer("submitted_by").notNull().references(() => users.id),
  
  // Personal Information
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  nationality: text("nationality").notNull(),
  passportNumber: text("passport_number").notNull(),
  passportExpiry: text("passport_expiry").notNull(),
  placeOfBirth: text("place_of_birth"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  
  // Contact Information
  streetAddress: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country").notNull(),
  phoneNumber: text("phone_number").notNull(),
  alternatePhone: text("alternate_phone"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  
  // Professional Information
  companyName: text("company_name").notNull(),
  jobTitle: text("job_title").notNull(),
  yearsExperience: text("years_experience").notNull(),
  previousLicenses: text("previous_licenses"),
  specializations: text("specializations"),
  businessAddress: text("business_address"),
  businessPhone: text("business_phone"),
  businessEmail: text("business_email"),
  linkedinProfile: text("linkedin_profile"),
  professionalReferences: text("professional_references"),
  
  // Document Paths
  passportPhotoPath: text("passport_photo_path"),
  passportDocumentPath: text("passport_document_path"),
  
  // Application Status
  applicationStatus: text("application_status").notNull().default("pending"), // pending, under_review, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  adminNotes: text("admin_notes"),
  cardGeneratedAt: timestamp("card_generated_at"),
  cardNumber: text("card_number"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBrokerCardApplicationSchema = createInsertSchema(brokerCardApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BrokerCardApplication = typeof brokerCardApplications.$inferSelect;
export type InsertBrokerCardApplication = z.infer<typeof insertBrokerCardApplicationSchema>;
