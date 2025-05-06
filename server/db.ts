import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a MySQL connection pool
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

// Create Drizzle instance with the MySQL pool
export const db = drizzle(poolConnection, { schema, mode: 'default' });
export const pool = poolConnection;
