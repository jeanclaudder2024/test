import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isSubscribed: boolean("is_subscribed"),
  subscriptionTier: text("subscription_tier").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

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
  buyerName: text("buyer_name").default("NA"),
  sellerName: text("seller_name"),
  metadata: text("metadata"), // JSON string with additional vessel information (heading, speed, course, etc.)
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertVesselSchema = createInsertSchema(vessels).omit({
  id: true,
  lastUpdated: true,
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

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  vesselId: integer("vessel_id").notNull(),
  type: text("type").notNull(), // e.g., SDS, LOI, BL
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").default("active"), // active, expired, pending, revoked
  issueDate: timestamp("issue_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  reference: text("reference"), // Document reference number
  issuer: text("issuer"), // Organization that issued document
  recipientName: text("recipient_name"),
  recipientOrg: text("recipient_org"),
  lastModified: timestamp("last_modified").defaultNow(),
  language: text("language").default("en"),
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
export const ports = pgTable("ports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull(),
  lat: decimal("lat", { precision: 10, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 6 }).notNull(),
  type: text("type").default("commercial"), // commercial, oil, container, bulk, etc.
  capacity: integer("capacity"), // handling capacity in TEU or tons per day
  status: text("status").default("active"),
  description: text("description"),
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

// Shipping Companies
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country"),
  region: text("region"),
  headquarters: text("headquarters"),
  foundedYear: integer("founded_year"),
  ceo: text("ceo"),
  fleetSize: integer("fleet_size"),
  specialization: text("specialization"), // e.g., Crude Oil, LNG, Products
  website: text("website"),
  logo: text("logo"), // URL to company logo
  description: text("description"),
  revenue: decimal("revenue", { precision: 15, scale: 2 }), // Revenue in millions
  employees: integer("employees"),
  publiclyTraded: boolean("publicly_traded").default(false),
  stockSymbol: text("stock_symbol"),
  status: text("status").default("active"),
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
