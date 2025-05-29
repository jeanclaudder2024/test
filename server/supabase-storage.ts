/**
 * Supabase Storage System - Oil Vessel Tracking Platform
 * Replaces problematic PostgreSQL connections with reliable Supabase
 */

import { supabase } from './supabase';
import type { 
  Vessel, Port, Refinery, Company, 
  InsertVessel, InsertPort, InsertRefinery, InsertCompany 
} from '@shared/schema';

export class SupabaseStorage {
  
  // Vessel operations
  async getVessels(): Promise<Vessel[]> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching vessels:', error);
      return [];
    }
  }

  async getVesselById(id: number): Promise<Vessel | undefined> {
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

  async createVessel(vessel: InsertVessel): Promise<Vessel> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .insert(vessel)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vessel:', error);
      throw error;
    }
  }

  async updateVessel(id: number, updates: Partial<InsertVessel>): Promise<Vessel> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .update(updates)
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
  async getPorts(): Promise<Port[]> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ports:', error);
      return [];
    }
  }

  async getPortById(id: number): Promise<Port | undefined> {
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

  async createPort(port: InsertPort): Promise<Port> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .insert(port)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating port:', error);
      throw error;
    }
  }

  // Refinery operations
  async getRefineries(): Promise<Refinery[]> {
    try {
      const { data, error } = await supabase
        .from('refineries')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching refineries:', error);
      return [];
    }
  }

  async createRefinery(refinery: InsertRefinery): Promise<Refinery> {
    try {
      const { data, error } = await supabase
        .from('refineries')
        .insert(refinery)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating refinery:', error);
      throw error;
    }
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert(company)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // Search operations
  async searchVessels(query: string): Promise<Vessel[]> {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .or(`name.ilike.%${query}%,imo.ilike.%${query}%,mmsi.ilike.%${query}%`)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching vessels:', error);
      return [];
    }
  }

  async searchPorts(query: string): Promise<Port[]> {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .or(`name.ilike.%${query}%,country.ilike.%${query}%,region.ilike.%${query}%`)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching ports:', error);
      return [];
    }
  }

  // Initialize tables if they don't exist
  async initializeTables(): Promise<boolean> {
    try {
      console.log('🔧 Checking Supabase tables...');
      
      // Test connection by trying to fetch from vessels table
      const { error } = await supabase.from('vessels').select('count').limit(1);
      
      if (error) {
        console.log('📋 Tables need to be created in Supabase...');
        // This would require SQL migrations in Supabase dashboard
        return false;
      }
      
      console.log('✅ Supabase tables are ready!');
      return true;
    } catch (error) {
      console.error('❌ Supabase table check error:', error);
      return false;
    }
  }
}

// Create singleton instance
export const supabaseStorage = new SupabaseStorage();