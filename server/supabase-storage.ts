import { supabase } from "./supabase";

export interface IStorage {
  // Vessel operations
  getVessels(): Promise<any[]>;
  getVesselById(id: string): Promise<any | undefined>;
  createVessel(vessel: any): Promise<any>;
  updateVessel(id: string, vessel: any): Promise<any>;
  
  // Port operations
  getPorts(): Promise<any[]>;
  getPortById(id: string): Promise<any | undefined>;
  createPort(port: any): Promise<any>;
  
  // User operations (for Supabase auth)
  getUserById(id: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  updateUser(id: string, user: any): Promise<any>;
}

export class SupabaseStorage implements IStorage {
  // Vessel operations
  async getVessels(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vessels:', error);
      return [];
    }
  }

  async getVesselById(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vessel:', error);
      return undefined;
    }
  }

  async createVessel(vessel: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .insert([vessel])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vessel:', error);
      throw error;
    }
  }

  async updateVessel(id: string, vessel: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .update(vessel)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating vessel:', error);
      throw error;
    }
  }

  // Port operations
  async getPorts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ports:', error);
      return [];
    }
  }

  async getPortById(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching port:', error);
      return undefined;
    }
  }

  async createPort(port: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .insert([port])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating port:', error);
      throw error;
    }
  }

  // User operations (for Supabase auth integration)
  async getUserById(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async createUser(user: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, user: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

export const storage = new SupabaseStorage();