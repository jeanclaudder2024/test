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
  destinationPort: text("destination_port"),
  eta: timestamp("eta"),
  cargoType: text("cargo_type"),
  cargoCapacity: integer("cargo_capacity"),
  currentRegion: text("current_region"),
});

export const insertVesselSchema = createInsertSchema(vessels).omit({
  id: true,
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
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

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

// Parts management schema
export const parts = pgTable("parts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  partNumber: text("part_number").notNull(),
  description: text("description"),
  category: text("category"),
  price: decimal("price"),
  quantity: integer("quantity").default(0),
  minimumStock: integer("minimum_stock").default(5),
  supplier: text("supplier"),
  supplierContact: text("supplier_contact"),
  lastPurchased: timestamp("last_purchased"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPartSchema = createInsertSchema(parts, {
  price: z.number().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  priority: text("priority").default("medium"),
  vesselId: integer("vessel_id").references(() => vessels.id),
  refineryId: integer("refinery_id").references(() => refineries.id),
  assignedTo: text("assigned_to"),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const partUsage = pgTable("part_usage", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id).notNull(),
  partId: integer("part_id").references(() => parts.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price"),
  purchasedFrom: text("purchased_from"),
  purchaseDate: timestamp("purchase_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartUsageSchema = createInsertSchema(partUsage, {
  unitPrice: z.number().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  website: text("website"),
  preferredPaymentTerms: text("preferred_payment_terms"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export type InsertPart = z.infer<typeof insertPartSchema>;
export type Part = typeof parts.$inferSelect;

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

export type InsertPartUsage = z.infer<typeof insertPartUsageSchema>;
export type PartUsage = typeof partUsage.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
