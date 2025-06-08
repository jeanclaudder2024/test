import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal, primaryKey, index } from "drizzle-orm/pg-core";
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

// Refineries
export const refineries = pgTable("refineries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 6 }).notNull(),
  capacity: integer("capacity"), // in barrels per day
  status: text("status").default("active"),
  description: text("description"),
  
  // Existing fields from the database
  operator: text("operator"),
  owner: text("owner"),
  type: text("type"),
  products: text("products"),
  year_built: integer("year_built"),
  last_maintenance: timestamp("last_maintenance"),
  next_maintenance: timestamp("next_maintenance"),
  complexity: decimal("complexity", { precision: 10, scale: 2 }),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  address: text("address"),
  technical_specs: text("technical_specs"),
  photo: text("photo"),
  city: text("city"),
  last_updated: timestamp("last_updated"),
  utilization: decimal("utilization", { precision: 10, scale: 2 }),
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
  
  // Geographic coordinates with transformation
  lat: z.union([z.string(), z.number()]).transform(val => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? undefined : String(num);
  }),
  lng: z.union([z.string(), z.number()]).transform(val => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? undefined : String(num);
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
  isActive: boolean("is_active").default(true),
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

// Landing Page Content Management
export const landingPageContent = pgTable("landing_page_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // hero, features, why-us, how-it-works, etc.
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  content: text("content"), // JSON string for flexible content
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLandingPageContentSchema = createInsertSchema(landingPageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLandingPageContent = z.infer<typeof insertLandingPageContentSchema>;
export type LandingPageContent = typeof landingPageContent.$inferSelect;

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
  displayName: text("display_name").notNull(),
  category: text("category").notNull(), // crude, refined, lng, lpg, petrochemical
  apiGravity: decimal("api_gravity", { precision: 5, scale: 2 }),
  sulfurContent: decimal("sulfur_content", { precision: 5, scale: 3 }),
  viscosity: decimal("viscosity", { precision: 8, scale: 2 }),
  density: decimal("density", { precision: 8, scale: 4 }),
  flashPoint: integer("flash_point"), // temperature in celsius
  pourPoint: integer("pour_point"), // temperature in celsius
  marketPrice: decimal("market_price", { precision: 10, scale: 2 }), // USD per barrel/ton
  priceUnit: text("price_unit").default("barrel"), // barrel, ton, gallon
  description: text("description"),
  commonUses: text("common_uses"), // JSON array of uses
  majorProducers: text("major_producers"), // JSON array of countries/companies
  tradingSymbol: text("trading_symbol"), // WTI, Brent, etc.
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

export type InsertOilType = z.infer<typeof insertOilTypeSchema>;
export type OilType = typeof oilTypes.$inferSelect;

// Regions Management
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
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
