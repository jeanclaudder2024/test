import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Determine if we should use Supabase or fallback to original PostgreSQL
const USE_SUPABASE = !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create Supabase client only if credentials are available
export const supabase = USE_SUPABASE ? 
  createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!, 
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public',
      }
    }
  ) : null;

console.log(`Database mode: ${USE_SUPABASE ? 'Supabase' : 'Original PostgreSQL'}`);

// Set up the original PostgreSQL pool for fallback
export const postgresPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const drizzleDb = drizzle(postgresPool, { schema });

// Export the appropriate db object based on the environment
export const db = USE_SUPABASE ? 
  // When Supabase is enabled, use this adapter
  {
    select: () => {
      return {
        from: (table: any) => {
          const tableName = getTableName(table);
          
          // Return a query builder with common operations
          const baseQuery = {
            where: (condition: any) => {
              try {
                // If Supabase client is available
                if (supabase) {
                  // For simplified condition handling, assuming eq() style conditions
                  if (condition && typeof condition === 'object') {
                    // Handle eq condition
                    if (condition.operator === '=') {
                      const field = condition.left.name;
                      const value = condition.right;
                      return supabase.from(tableName).select('*').eq(field, value);
                    }
                    
                    // Handle AND conditions
                    if (condition.operator === 'AND') {
                      let query = supabase.from(tableName).select('*');
                      
                      // Process each condition in the AND
                      if (Array.isArray(condition.conditions)) {
                        condition.conditions.forEach((cond: any) => {
                          if (cond.operator === '=') {
                            const field = cond.left.name;
                            const value = cond.right;
                            query = query.eq(field, value);
                          }
                        });
                      }
                      
                      return query;
                    }
                  }
                  
                  // Default fallback
                  console.warn('Unhandled condition type in Supabase query, returning all rows', condition);
                  return supabase.from(tableName).select('*');
                }
              } catch (error) {
                console.error('Error in Supabase query, falling back to Drizzle', error);
              }
              
              // If Supabase fails or is not available, fall back to Drizzle
              return drizzleDb.select().from(table).where(condition);
            },
            orderBy: (field: any, order = 'asc') => {
              try {
                // If Supabase client is available
                if (supabase) {
                  // Extract field name if it's an object
                  const fieldName = typeof field === 'object' && field.name ? field.name : field;
                  return supabase.from(tableName).select('*').order(fieldName, { ascending: order === 'asc' });
                }
              } catch (error) {
                console.error('Error in Supabase query, falling back to Drizzle', error);
              }
              
              // Fall back to Drizzle
              return drizzleDb.select().from(table).orderBy(field);
            }
          };
          
          return baseQuery;
        }
      };
    },
    insert: (table: any) => {
      return {
        values: (data: any) => {
          return {
            returning: () => {
              try {
                // If Supabase client is available
                if (supabase) {
                  const tableName = getTableName(table);
                  return supabase.from(tableName).insert(data).select();
                }
              } catch (error) {
                console.error('Error in Supabase insert, falling back to Drizzle', error);
              }
              
              // Fall back to Drizzle
              return drizzleDb.insert(table).values(data).returning();
            }
          };
        }
      };
    },
    update: (table: any) => {
      return {
        set: (data: any) => {
          return {
            where: (condition: any) => {
              return {
                returning: () => {
                  try {
                    // If Supabase client is available
                    if (supabase) {
                      const tableName = getTableName(table);
                      let query = supabase.from(tableName).update(data);
                      
                      // Handle conditions
                      if (condition && typeof condition === 'object') {
                        if (condition.operator === '=') {
                          const field = condition.left.name;
                          const value = condition.right;
                          query = query.eq(field, value);
                        }
                      }
                      
                      return query.select();
                    }
                  } catch (error) {
                    console.error('Error in Supabase update, falling back to Drizzle', error);
                  }
                  
                  // Fall back to Drizzle
                  return drizzleDb.update(table).set(data).where(condition).returning();
                }
              };
            }
          };
        }
      };
    },
    delete: (table: any) => {
      return {
        where: (condition: any) => {
          try {
            // If Supabase client is available
            if (supabase) {
              const tableName = getTableName(table);
              let query = supabase.from(tableName).delete();
              
              // Handle conditions
              if (condition && typeof condition === 'object') {
                if (condition.operator === '=') {
                  const field = condition.left.name;
                  const value = condition.right;
                  query = query.eq(field, value);
                }
              }
              
              return query;
            }
          } catch (error) {
            console.error('Error in Supabase delete, falling back to Drizzle', error);
          }
          
          // Fall back to Drizzle
          return drizzleDb.delete(table).where(condition);
        }
      };
    }
  } : 
  // When Supabase is disabled, use Drizzle directly
  drizzleDb;

// Helper to get table name from table object
function getTableName(table: any): string {
  // This is a temporary function to extract table names from our schema objects
  if (table === schema.users) return 'users';
  if (table === schema.vessels) return 'vessels';
  if (table === schema.refineries) return 'refineries';
  if (table === schema.progressEvents) return 'progress_events';
  if (table === schema.documents) return 'documents';
  if (table === schema.brokers) return 'brokers';
  if (table === schema.stats) return 'stats';
  if (table === schema.ports) return 'ports';
  if (table === schema.refineryPortConnections) return 'refinery_port_connections';
  if (table === schema.companies) return 'companies';
  if (table === schema.subscriptionPlans) return 'subscription_plans';
  if (table === schema.subscriptions) return 'subscriptions';
  if (table === schema.paymentMethods) return 'payment_methods';
  if (table === schema.invoices) return 'invoices';
  
  throw new Error(`Unknown table: ${JSON.stringify(table)}`);
}

// For backwards compatibility with code that might be using the old connections
export const pool = {
  query: async (query: string, params: any[] = []) => {
    try {
      if (USE_SUPABASE && supabase) {
        console.log('Using legacy pool query with Supabase, query:', query);
        // Pass the query to Supabase RPC if available
        return supabase.rpc('run_sql', { sql: query, params });
      } else {
        console.log('Using PostgreSQL direct pool query:', query);
        // Fall back to direct PostgreSQL pool
        return postgresPool.query(query, params);
      }
    } catch (error) {
      console.error('Error in pool query, falling back to direct PostgreSQL:', error);
      return postgresPool.query(query, params);
    }
  }
};
