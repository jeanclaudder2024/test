import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Extract connection params from DATABASE_URL to avoid URL parsing issues
const databaseUrl = process.env.DATABASE_URL;

let pool: any;

try {
  // Extract password from URL more safely
  const url = new URL(databaseUrl);
  const password = url.password;
  
  // Extract connection details from DATABASE_URL
  const connectionConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 6543,
    database: url.pathname.substring(1), // Remove leading slash
    username: url.username,
    password: password,
    ssl: 'require',
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {}, // Suppress notices
    transform: {
      undefined: null,
    },
  };
  
  console.log('Attempting connection with config:', {
    host: connectionConfig.host,
    port: connectionConfig.port,
    database: connectionConfig.database,
    username: connectionConfig.username,
    password: password ? 'Set' : 'Not set'
  });
  
  // Create connection using object config to avoid URL parsing
  pool = postgres(connectionConfig);
} catch (error) {
  console.log('Failed to parse connection config, falling back to URL:', error);
  // Fallback to URL-based connection if parsing fails
  pool = postgres(databaseUrl, {
    ssl: 'require',
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {}, // Suppress notices
    transform: {
      undefined: null,
    },
  });
}

export { pool };
export const db = drizzle(pool, { schema });

export function getActiveDb() {
  return db;
}
