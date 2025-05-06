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

// Create a simplified db object that matches Drizzle's interface but uses Supabase
export const db = {
  select: () => {
    return {
      from: (table: any) => {
        return {
          where: (condition: any) => {
            // This is a simplification, we'll replace with actual Supabase queries in the storage layer
            const tableName = getTableName(table);
            return supabase.from(tableName).select('*');
          },
          orderBy: (field: any, order = 'asc') => {
            const tableName = getTableName(table);
            return supabase.from(tableName).select('*').order(field, { ascending: order === 'asc' });
          }
        };
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
        return {
          where: (condition: any) => {
            const tableName = getTableName(table);
            return {
              returning: () => supabase.from(tableName).update(data).select()
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
        return supabase.from(tableName).delete();
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
