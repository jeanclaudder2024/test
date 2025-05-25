/**
 * Database Switcher Utility
 * Allows switching between your existing database and Supabase at runtime
 */

import { getActiveDb, switchToDatabase, primaryDb, secondaryDb } from "./db";

export class DatabaseSwitcher {
  private currentDb: any;
  
  constructor() {
    this.currentDb = getActiveDb();
  }

  /**
   * Switch to primary database (your existing one)
   */
  usePrimaryDatabase() {
    this.currentDb = primaryDb;
    console.log('Switched to primary database');
    return this.currentDb;
  }

  /**
   * Switch to Supabase database
   */
  useSupabaseDatabase() {
    if (!secondaryDb) {
      throw new Error('Supabase database not configured. Please add SUPABASE_DATABASE_URL to your environment variables.');
    }
    this.currentDb = secondaryDb;
    console.log('Switched to Supabase database');
    return this.currentDb;
  }

  /**
   * Get current active database
   */
  getCurrentDatabase() {
    return this.currentDb;
  }

  /**
   * Check which database is currently active
   */
  getDatabaseType(): 'primary' | 'supabase' {
    if (this.currentDb === secondaryDb) {
      return 'supabase';
    }
    return 'primary';
  }

  /**
   * Test connection to both databases
   */
  async testConnections() {
    const results = {
      primary: false,
      supabase: false,
      errors: {} as any
    };

    // Test primary database
    try {
      await primaryDb.select().from('vessels').limit(1);
      results.primary = true;
    } catch (error) {
      results.errors.primary = error;
    }

    // Test Supabase database
    if (secondaryDb) {
      try {
        await secondaryDb.select().from('vessels').limit(1);
        results.supabase = true;
      } catch (error) {
        results.errors.supabase = error;
      }
    }

    return results;
  }
}

// Export singleton instance
export const dbSwitcher = new DatabaseSwitcher();