import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Primary database connection (your existing database)
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Secondary database connection (Supabase)
let supabasePool: Pool | null = null;
let supabaseDb: any = null;

if (process.env.SUPABASE_DATABASE_URL) {
  try {
    supabasePool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
    supabaseDb = drizzle({ client: supabasePool, schema });
    console.log('Supabase database connection established');
  } catch (error) {
    console.warn('Failed to connect to Supabase database:', error);
  }
}

// Third database connection (MySQL)
let mysqlConnection: any = null;
let mysqlDb: any = null;

if (process.env.MYSQL_DATABASE_URL) {
  try {
    mysqlConnection = mysql.createPool(process.env.MYSQL_DATABASE_URL);
    mysqlDb = drizzleMysql(mysqlConnection, { schema, mode: 'default' });
    console.log('MySQL database connection established');
  } catch (error) {
    console.warn('Failed to connect to MySQL database:', error);
  }
}

// Export all database connections
export const primaryDb = db; // Your existing PostgreSQL database
export const secondaryDb = supabaseDb; // Supabase database
export const tertiaryDb = mysqlDb; // MySQL database

// Helper function to get the active database based on environment
export function getActiveDb() {
  const useSupabase = process.env.USE_SUPABASE === 'true';
  const useMySQL = process.env.USE_MYSQL === 'true';
  
  if (useMySQL && mysqlDb) {
    console.log('Using MySQL database');
    return mysqlDb;
  } else if (useSupabase && supabaseDb) {
    console.log('Using Supabase database');
    return supabaseDb;
  } else {
    console.log('Using primary PostgreSQL database');
    return primaryDb;
  }
}

// Helper function to switch database at runtime
export function switchToDatabase(dbType: 'primary' | 'supabase' | 'mysql') {
  if (dbType === 'mysql') {
    if (!mysqlDb) {
      throw new Error('MySQL database not configured. Please set MYSQL_DATABASE_URL');
    }
    return mysqlDb;
  } else if (dbType === 'supabase') {
    if (!supabaseDb) {
      throw new Error('Supabase database not configured. Please set SUPABASE_DATABASE_URL');
    }
    return supabaseDb;
  } else {
    return primaryDb;
  }
}

// نظام التبديل التلقائي للقواعد
let currentActiveDb = db;
let lastConnectionTest = Date.now();
const CONNECTION_TEST_INTERVAL = 30000; // 30 ثانية

/**
 * اختبار الاتصال مع قاعدة البيانات
 */
async function testDatabaseConnection(database: any): Promise<boolean> {
  try {
    await database.execute(`SELECT 1 as test`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * الحصول على قاعدة البيانات مع التبديل التلقائي
 */
export async function getDbWithFailover() {
  const now = Date.now();
  
  // اختبار الاتصال كل 30 ثانية فقط
  if (now - lastConnectionTest > CONNECTION_TEST_INTERVAL) {
    lastConnectionTest = now;
    
    // اختبار قاعدة البيانات الحالية
    const isCurrentDbWorking = await testDatabaseConnection(currentActiveDb);
    
    if (!isCurrentDbWorking) {
      console.warn('⚠️ فقدان الاتصال مع قاعدة البيانات الحالية، جاري البحث عن بديل...');
      
      // محاولة الاتصال بالقواعد البديلة
      if (mysqlDb && await testDatabaseConnection(mysqlDb)) {
        console.log('🔄 تم التبديل إلى MySQL');
        currentActiveDb = mysqlDb;
        return currentActiveDb;
      }
      
      if (supabaseDb && await testDatabaseConnection(supabaseDb)) {
        console.log('🔄 تم التبديل إلى Supabase');
        currentActiveDb = supabaseDb;
        return currentActiveDb;
      }
      
      // العودة إلى القاعدة الأساسية
      if (await testDatabaseConnection(db)) {
        console.log('✅ عاد الاتصال مع القاعدة الأساسية');
        currentActiveDb = db;
        return currentActiveDb;
      }
      
      console.error('❌ فشل الاتصال مع جميع قواعد البيانات');
      throw new Error('جميع قواعد البيانات غير متاحة');
    }
  }
  
  return currentActiveDb;
}

/**
 * إنشاء جداول MySQL تلقائياً
 */
export async function createMySQLTablesIfNeeded() {
  if (!mysqlDb) return;
  
  try {
    console.log('🔧 إنشاء جداول MySQL...');
    
    // إنشاء جدول المستخدمين
    await mysqlDb.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        display_name VARCHAR(255),
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'user',
        is_subscribed BOOLEAN DEFAULT FALSE,
        subscription_tier VARCHAR(50) DEFAULT 'free',
        stripe_customer_id VARCHAR(255),
        subscription_plan_id INT,
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        last_login TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // إنشاء جدول السفن
    await mysqlDb.execute(`
      CREATE TABLE IF NOT EXISTS vessels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        imo VARCHAR(20),
        mmsi VARCHAR(20),
        vessel_type VARCHAR(100),
        flag VARCHAR(100),
        built INT,
        deadweight INT,
        cargo_capacity INT,
        current_lat VARCHAR(20),
        current_lng VARCHAR(20),
        destination VARCHAR(255),
        eta TIMESTAMP NULL,
        status VARCHAR(50),
        speed VARCHAR(10),
        course VARCHAR(10),
        draught VARCHAR(10),
        last_position_update TIMESTAMP NULL,
        route_data JSON,
        cargo_info TEXT,
        owner VARCHAR(255),
        operator_company VARCHAR(255),
        departure_port VARCHAR(255),
        arrival_port VARCHAR(255),
        departure_date TIMESTAMP NULL,
        arrival_date TIMESTAMP NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_vessel_type (vessel_type),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // إنشاء الجداول الأخرى...
    await mysqlDb.execute(`
      CREATE TABLE IF NOT EXISTS refineries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        region VARCHAR(255) NOT NULL,
        lat VARCHAR(20) NOT NULL,
        lng VARCHAR(20) NOT NULL,
        capacity INT,
        status VARCHAR(50),
        type VARCHAR(50),
        operator VARCHAR(255),
        owner VARCHAR(255),
        products TEXT,
        year_built INT,
        last_maintenance TIMESTAMP NULL,
        next_maintenance TIMESTAMP NULL,
        complexity VARCHAR(10),
        email VARCHAR(255),
        phone VARCHAR(50),
        website VARCHAR(255),
        address TEXT,
        technical_specs TEXT,
        photo VARCHAR(255),
        city VARCHAR(255),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        utilization VARCHAR(10),
        INDEX idx_region (region),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ تم إنشاء جداول MySQL بنجاح');
  } catch (error) {
    console.error('❌ خطأ في إنشاء جداول MySQL:', error);
  }
}

// تهيئة جداول MySQL عند بدء التطبيق
if (mysqlDb) {
  createMySQLTablesIfNeeded().catch(console.error);
}
