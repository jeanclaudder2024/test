import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_KEY must be set. Did you forget to add your Supabase credentials?",
  );
}

// Create Supabase client as the main database interface
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    db: {
      schema: 'public',
    }
  }
);

console.log("Connecting to Supabase with client API");

// Create a more robust db object that matches Drizzle's interface but uses Supabase
export const db = {
  select: () => {
    return {
      from: (table: any) => {
        const tableName = getTableName(table);
        
        // Return a query builder with common operations
        const baseQuery = {
          where: (condition: any) => {
            // For simplified condition handling, assuming eq() style conditions
            // In a more complex implementation, we would parse the condition tree
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
            console.warn('Unhandled condition type in query, returning all rows', condition);
            return supabase.from(tableName).select('*');
          },
          orderBy: (field: any, order = 'asc') => {
            // Extract field name if it's an object
            const fieldName = typeof field === 'object' && field.name ? field.name : field;
            return supabase.from(tableName).select('*').order(fieldName, { ascending: order === 'asc' });
          }
        };
        
        return baseQuery;
      }
    };
  },
  insert: (table: any) => {
    return {
      values: (data: any) => {
        const tableName = getTableName(table);
        return {
          returning: () => supabase.from(tableName).insert(data).select()
        };
      }
    };
  },
  update: (table: any) => {
    return {
      set: (data: any) => {
        const tableName = getTableName(table);
        
        return {
          where: (condition: any) => {
            let query = supabase.from(tableName).update(data);
            
            // Handle conditions similarly to select where()
            if (condition && typeof condition === 'object') {
              if (condition.operator === '=') {
                const field = condition.left.name;
                const value = condition.right;
                query = query.eq(field, value);
              }
            }
            
            return {
              returning: () => query.select()
            };
          }
        };
      }
    };
  },
  delete: (table: any) => {
    return {
      where: (condition: any) => {
        const tableName = getTableName(table);
        let query = supabase.from(tableName).delete();
        
        // Handle conditions similarly to select where()
        if (condition && typeof condition === 'object') {
          if (condition.operator === '=') {
            const field = condition.left.name;
            const value = condition.right;
            query = query.eq(field, value);
          }
        }
        
        return query;
      }
    };
  }
};

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
    console.log('Using legacy pool query with Supabase, query:', query);
    // This is a simplified version that just passes the query to Supabase RPC
    return supabase.rpc('run_sql', { sql: query, params });
  }
};
