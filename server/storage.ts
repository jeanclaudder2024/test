import { SupabaseStorage } from "./supabase-storage";
import type { Database } from "../shared/supabase-types";

// Import Supabase row types
type VesselRow = Database['public']['Tables']['vessels']['Row'];
type PortRow = Database['public']['Tables']['ports']['Row'];
type RefineryRow = Database['public']['Tables']['refineries']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];

// Storage interface matching Supabase database structure
export interface IStorage {
  // User methods
  getUsers(): Promise<UserRow[]>;
  getUserById(id: number): Promise<UserRow | null>;
  getUserByEmail(email: string): Promise<UserRow | null>;
  createUser(user: Omit<UserRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRow>;
  updateUser(id: number, updates: Partial<UserRow>): Promise<UserRow>;
  deleteUser(id: number): Promise<void>;

  // Vessel methods
  getVessels(): Promise<VesselRow[]>;
  getVesselById(id: number): Promise<VesselRow | null>;
  createVessel(vessel: Omit<VesselRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<VesselRow>;
  updateVessel(id: number, updates: Partial<VesselRow>): Promise<VesselRow>;
  deleteVessel(id: number): Promise<void>;
  
  // Port methods
  getPorts(): Promise<PortRow[]>;
  getPortById(id: number): Promise<PortRow | null>;
  createPort(port: Omit<PortRow, 'id' | 'createdAt'>): Promise<PortRow>;
  updatePort(id: number, updates: Partial<PortRow>): Promise<PortRow>;
  deletePort(id: number): Promise<void>;
  
  // Refinery methods
  getRefineries(): Promise<RefineryRow[]>;
  getRefineryById(id: number): Promise<RefineryRow | null>;
  createRefinery(refinery: Omit<RefineryRow, 'id' | 'createdAt'>): Promise<RefineryRow>;
  updateRefinery(id: number, updates: Partial<RefineryRow>): Promise<RefineryRow>;
  deleteRefinery(id: number): Promise<void>;
  clearAllRefineries(): Promise<void>;

  // Oil Types
  getOilTypes(): Promise<any[]>;

  // Document methods  
  getVesselDocuments(): Promise<any[]>;
  createDocument(doc: any): Promise<any>;
  updateDocument(id: number, updates: any): Promise<any>;
  deleteDocument(id: number): Promise<void>;
  getDocumentById(id: number): Promise<any>;

  // Analysis data methods
  getReports(): Promise<any[]>;
  getRegionalData(): Promise<any[]>;
  
  // Subscription methods
  getSubscriptionPlans(): Promise<any[]>;
  getSubscriptions(): Promise<any[]>;
  createSubscriptionPlan(plan: any): Promise<any>;
  updateSubscriptionPlan(id: number, updates: any): Promise<any>;
  getSubscriptionPlanById(id: number): Promise<any>;
  deleteSubscriptionPlan(id: number): Promise<void>;
}

// Global storage instance using SupabaseStorage
const storage = new SupabaseStorage();
export { storage };