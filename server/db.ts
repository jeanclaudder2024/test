import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon with websocket
neonConfig.webSocketConstructor = ws;

// Connection options
const CONNECTION_RETRY_ATTEMPTS = 5;
const CONNECTION_RETRY_DELAY = 3000; // 3 seconds

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a connection pool with robust configuration
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection
  allowExitOnIdle: false // Don't allow the pool to exit while idle
});

// Set up event listeners for the pool
pool.on('connect', (client) => {
  console.log('New client connected to database pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected database pool error on idle client:', err);
});

// Create a drizzle instance
export const db = drizzle({ client: pool, schema });

// Export a helper function to check database connection
export async function checkDatabaseConnection() {
  let retries = 0;
  
  while (retries < CONNECTION_RETRY_ATTEMPTS) {
    try {
      // Try to connect and execute a simple query
      const client = await pool.connect();
      const result = await client.query('SELECT 1 as connection_test');
      client.release();
      
      console.log('Database connection successful');
      return true;
    } catch (error) {
      retries++;
      console.error(`Database connection attempt ${retries} failed:`, error.message);
      
      if (retries >= CONNECTION_RETRY_ATTEMPTS) {
        console.error('All database connection attempts failed');
        return false;
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, CONNECTION_RETRY_DELAY));
    }
  }
  
  return false;
}
