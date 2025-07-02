import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal, primaryKey, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Custom users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // 'admin' or 'user'
  createdAt: timestamp("created_at").defaultNow(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  trialStartDate: timestamp("trial_start_date").notNull(),
  trialEndDate: timestamp("trial_end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
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
  trialStartDate: true,
  trialEndDate: true,
  isActive: true,
});

// Register schema with validation
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Login schema
export const loginSchema = z.object({
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
  departurePort: text("departure_port"),
  departureDate: timestamp("departure_date"),
  departureLat: decimal("departure_lat", { precision: 10, scale: 6 }),
  departureLng: decimal("departure_lng", { precision: 10, scale: 6 }),
  destinationPort: text("destination_port"), // Will store refinery references in format "REF:id:name"
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

// Type Exports

export type InsertVessel = z.infer<typeof insertVesselSchema>;
export type Vessel = typeof vessels.$inferSelect;

export type InsertRefinery = z.infer<typeof insertRefinerySchema>;
export type Refinery = typeof refineries.$inferSelect;

export type InsertProgressEvent = z.infer<typeof insertProgressEventSchema>;
export type ProgressEvent = typeof progressEvents.$inferSelect;



export type InsertBroker = z.infer<typeof insertBrokerSchema>;
export type Broker = typeof brokers.$inferSelect;

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

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  monthlyPriceId: text("monthly_price_id").notNull(), // Stripe price ID for monthly billing
  yearlyPriceId: text("yearly_price_id").notNull(), // Stripe price ID for yearly billing
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("usd"),
  features: text("features").notNull(), // JSON array of features as a string
  isPopular: boolean("is_popular").default(false),
  trialDays: integer("trial_days").default(0),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

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

// Oil Types Management
export const oilTypes = pgTable("oil_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  apiGravity: decimal("api_gravity", { precision: 5, scale: 2 }),
  sulfurContent: text("sulfur_content"),
  viscosity: text("viscosity"),
  color: text("color"),
  origin: text("origin"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOilTypeSchema = createInsertSchema(oilTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOilType = z.infer<typeof insertOilTypeSchema>;
export type OilType = typeof oilTypes.$inferSelect;

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

export const landingPageContent = pgTable("landing_page_content", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => landingPageSections.id).notNull(),
  contentKey: varchar("content_key", { length: 100 }).notNull(),
  contentType: varchar("content_type", { length: 50 }).default("text"),
  contentValue: text("content_value"),
  placeholderText: varchar("placeholder_text", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueContent: unique("unique_section_content").on(table.sectionId, table.contentKey),
}));

export const landingPageImages = pgTable("landing_page_images", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => landingPageSections.id).notNull(),
  imageKey: varchar("image_key", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  altText: varchar("alt_text", { length: 255 }),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueImage: unique("unique_section_image").on(table.sectionId, table.imageKey),
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

export const insertLandingPageContentSchema = createInsertSchema(landingPageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLandingPageImageSchema = createInsertSchema(landingPageImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLandingPageBlockSchema = createInsertSchema(landingPageBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LandingPageSection = typeof landingPageSections.$inferSelect;
export type LandingPageContent = typeof landingPageContent.$inferSelect;
export type LandingPageImage = typeof landingPageImages.$inferSelect;
export type LandingPageBlock = typeof landingPageBlocks.$inferSelect;
export type InsertLandingPageSection = z.infer<typeof insertLandingPageSectionSchema>;
export type InsertLandingPageContent = z.infer<typeof insertLandingPageContentSchema>;
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

// Broker Deals Management
export const brokerDeals = pgTable("broker_deals", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id),
  companyId: integer("company_id").notNull().references(() => realCompanies.id),
  dealTitle: text("deal_title").notNull(),
  dealValue: text("deal_value").notNull(),
  status: text("status").notNull().default("pending"), // active, pending, completed, cancelled
  progress: integer("progress").default(0), // 0-100
  oilType: text("oil_type").notNull(),
  quantity: text("quantity").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  notes: text("notes"),
  commissionRate: text("commission_rate"),
  commissionAmount: text("commission_amount"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Broker Documents
export const brokerDocuments = pgTable("broker_documents", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id),
  dealId: integer("deal_id").references(() => brokerDeals.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: text("file_size").notNull(),
  filePath: text("file_path").notNull(),
  description: text("description"),
  uploadedBy: text("uploaded_by").notNull(),
  downloadCount: integer("download_count").default(0),
  isPublic: boolean("is_public").default(false),
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Files sent to Brokers
export const adminBrokerFiles = pgTable("admin_broker_files", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id),
  sentByUserId: integer("sent_by_user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: text("file_size").notNull(),
  filePath: text("file_path").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("other"), // contract, compliance, legal, technical, other
  priority: text("priority").default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  expiresAt: timestamp("expires_at"),
  requiresSignature: boolean("requires_signature").default(false),
  signedAt: timestamp("signed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Broker Deal Activities/Timeline
export const brokerDealActivities = pgTable("broker_deal_activities", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => brokerDeals.id),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(), // status_change, document_added, note_added, etc.
  description: text("description").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Broker Statistics
export const brokerStats = pgTable("broker_stats", {
  id: serial("id").primaryKey(),
  brokerId: integer("broker_id").notNull().references(() => users.id),
  totalDeals: integer("total_deals").default(0),
  activeDeals: integer("active_deals").default(0),
  completedDeals: integer("completed_deals").default(0),
  cancelledDeals: integer("cancelled_deals").default(0),
  totalValue: text("total_value").default("0"),
  totalCommission: text("total_commission").default("0"),
  successRate: integer("success_rate").default(0), // percentage
  averageDealSize: text("average_deal_size").default("0"),
  lastActivityAt: timestamp("last_activity_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for broker tables
export const insertBrokerDealSchema = createInsertSchema(brokerDeals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrokerDocumentSchema = createInsertSchema(brokerDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminBrokerFileSchema = createInsertSchema(adminBrokerFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBrokerDealActivitySchema = createInsertSchema(brokerDealActivities).omit({
  id: true,
  createdAt: true,
});

export const insertBrokerStatsSchema = createInsertSchema(brokerStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for broker tables
export type BrokerDeal = typeof brokerDeals.$inferSelect;
export type InsertBrokerDeal = z.infer<typeof insertBrokerDealSchema>;
export type BrokerDocument = typeof brokerDocuments.$inferSelect;
export type InsertBrokerDocument = z.infer<typeof insertBrokerDocumentSchema>;
export type AdminBrokerFile = typeof adminBrokerFiles.$inferSelect;
export type InsertAdminBrokerFile = z.infer<typeof insertAdminBrokerFileSchema>;
export type BrokerDealActivity = typeof brokerDealActivities.$inferSelect;
export type InsertBrokerDealActivity = z.infer<typeof insertBrokerDealActivitySchema>;
export type BrokerStats = typeof brokerStats.$inferSelect;
export type InsertBrokerStats = z.infer<typeof insertBrokerStatsSchema>;
