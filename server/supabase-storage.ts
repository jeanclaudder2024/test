import { supabase } from './db-supabase';
import type { Database } from '../shared/supabase-types';
import type { IStorage } from './storage';

// Type aliases for cleaner code
type VesselRow = Database['public']['Tables']['vessels']['Row'];
type PortRow = Database['public']['Tables']['ports']['Row'];
type RefineryRow = Database['public']['Tables']['refineries']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];

export class SupabaseStorage implements IStorage {
  
  // Vessel methods
  async getVessels(): Promise<VesselRow[]> {
    const { data, error } = await supabase
      .from('vessels')
      .select('*')
      .order('id');
    
    if (error) throw new Error(`Failed to fetch vessels: ${error.message}`);
    return data || [];
  }

  async getVesselById(id: number): Promise<VesselRow | null> {
    const { data, error } = await supabase
      .from('vessels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch vessel: ${error.message}`);
    }
    return data || null;
  }

  async createVessel(vessel: Omit<VesselRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<VesselRow> {
    const { data, error } = await supabase
      .from('vessels')
      .insert(vessel)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create vessel: ${error.message}`);
    return data;
  }

  async updateVessel(id: number, updates: Partial<VesselRow>): Promise<VesselRow> {
    const { data, error } = await supabase
      .from('vessels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update vessel: ${error.message}`);
    return data;
  }

  async deleteVessel(id: number): Promise<void> {
    const { error } = await supabase
      .from('vessels')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete vessel: ${error.message}`);
  }

  // Port methods
  async getPorts(): Promise<PortRow[]> {
    const { data, error } = await supabase
      .from('ports')
      .select('*')
      .order('id');
    
    if (error) throw new Error(`Failed to fetch ports: ${error.message}`);
    return data || [];
  }

  async getPortById(id: number): Promise<PortRow | null> {
    const { data, error } = await supabase
      .from('ports')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch port: ${error.message}`);
    }
    return data || null;
  }

  async createPort(port: Omit<PortRow, 'id' | 'createdAt'>): Promise<PortRow> {
    const { data, error } = await supabase
      .from('ports')
      .insert(port)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create port: ${error.message}`);
    return data;
  }

  async updatePort(id: number, updates: Partial<PortRow>): Promise<PortRow> {
    const { data, error } = await supabase
      .from('ports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update port: ${error.message}`);
    return data;
  }

  async deletePort(id: number): Promise<void> {
    // First, update vessels that reference this port
    await supabase
      .from('vessels')
      .update({ 
        departurePort: null,
        destinationPort: null 
      })
      .or(`departurePort.eq.${id},destinationPort.eq.${id}`);

    // Then delete the port
    const { error } = await supabase
      .from('ports')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete port: ${error.message}`);
  }

  // Refinery methods
  async getRefineries(): Promise<RefineryRow[]> {
    const { data, error } = await supabase
      .from('refineries')
      .select('*')
      .order('id');
    
    if (error) throw new Error(`Failed to fetch refineries: ${error.message}`);
    return data || [];
  }

  async getRefineryById(id: number): Promise<RefineryRow | null> {
    const { data, error } = await supabase
      .from('refineries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch refinery: ${error.message}`);
    }
    return data || null;
  }

  async createRefinery(refinery: Omit<RefineryRow, 'id' | 'createdAt'>): Promise<RefineryRow> {
    const { data, error } = await supabase
      .from('refineries')
      .insert(refinery)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create refinery: ${error.message}`);
    return data;
  }

  async updateRefinery(id: number, updates: Partial<RefineryRow>): Promise<RefineryRow> {
    const { data, error } = await supabase
      .from('refineries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update refinery: ${error.message}`);
    return data;
  }

  async deleteRefinery(id: number): Promise<void> {
    const { error } = await supabase
      .from('refineries')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete refinery: ${error.message}`);
  }

  // User methods
  async getUsers(): Promise<UserRow[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id');
    
    if (error) throw new Error(`Failed to fetch users: ${error.message}`);
    return data || [];
  }

  async getUserById(id: number): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    return data || null;
  }

  async getUserByEmail(email: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }
    return data || null;
  }

  async createUser(user: Omit<UserRow, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRow> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data;
  }

  async updateUser(id: number, updates: Partial<UserRow>): Promise<UserRow> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }

  async deleteUser(id: number): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(`Failed to delete user: ${error.message}`);
  }

  // Placeholder methods for interface compatibility
  // These would need to be implemented based on your specific schema
  async getOilTypes(): Promise<any[]> {
    // If you have an oil_types table, implement this
    return [];
  }

  async getVesselDocuments(): Promise<any[]> {
    // If you have a documents table, implement this
    return [];
  }

  async createDocument(doc: any): Promise<any> {
    throw new Error('createDocument not implemented for Supabase storage');
  }

  async updateDocument(id: number, updates: any): Promise<any> {
    throw new Error('updateDocument not implemented for Supabase storage');
  }

  async deleteDocument(id: number): Promise<void> {
    throw new Error('deleteDocument not implemented for Supabase storage');
  }

  async getDocumentById(id: number): Promise<any> {
    throw new Error('getDocumentById not implemented for Supabase storage');
  }

  // Add other required methods as placeholders
  async clearAllRefineries(): Promise<void> {
    const { error } = await supabase
      .from('refineries')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (error) throw new Error(`Failed to clear refineries: ${error.message}`);
  }

  async getReports(): Promise<any[]> {
    return [];
  }

  async getRegionalData(): Promise<any[]> {
    return [];
  }

  async getSubscriptionPlans(): Promise<any[]> {
    return [];
  }

  async getSubscriptions(): Promise<any[]> {
    return [];
  }

  async createSubscriptionPlan(plan: any): Promise<any> {
    throw new Error('createSubscriptionPlan not implemented');
  }

  async updateSubscriptionPlan(id: number, updates: any): Promise<any> {
    throw new Error('updateSubscriptionPlan not implemented');
  }

  async getSubscriptionPlanById(id: number): Promise<any> {
    throw new Error('getSubscriptionPlanById not implemented');
  }

  async deleteSubscriptionPlan(id: number): Promise<void> {
    throw new Error('deleteSubscriptionPlan not implemented');
  }
}