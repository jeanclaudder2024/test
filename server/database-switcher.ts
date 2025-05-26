/**
 * نظام تبديل قواعد البيانات التلقائي
 * يتصل بـ MySQL في حالة تعطل PostgreSQL
 */

import { drizzle as drizzlePg, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleMysql, MySql2Database } from 'drizzle-orm/mysql2';
import { Pool as NeonPool } from '@neondatabase/serverless';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';

export type DatabaseType = 'postgresql' | 'mysql';
export type DatabaseInstance = NeonDatabase<typeof schema> | MySql2Database<typeof schema>;

class DatabaseSwitcher {
  private currentDb: DatabaseInstance | null = null;
  private currentType: DatabaseType | null = null;
  private pgPool: NeonPool | null = null;
  private mysqlPool: mysql.Pool | null = null;
  private isConnecting = false;

  /**
   * الحصول على اتصال قاعدة البيانات مع التبديل التلقائي
   */
  async getDatabase(): Promise<{ db: DatabaseInstance; type: DatabaseType }> {
    if (this.currentDb && this.currentType) {
      try {
        // اختبار الاتصال الحالي
        await this.testConnection(this.currentDb, this.currentType);
        return { db: this.currentDb, type: this.currentType };
      } catch (error) {
        console.warn(`⚠️ فقدان الاتصال مع ${this.currentType}، جاري المحاولة مع قاعدة البيانات الاحتياطية...`);
        this.currentDb = null;
        this.currentType = null;
      }
    }

    if (this.isConnecting) {
      // انتظار حتى انتهاء محاولة الاتصال الحالية
      await this.waitForConnection();
      if (this.currentDb && this.currentType) {
        return { db: this.currentDb, type: this.currentType };
      }
    }

    this.isConnecting = true;

    try {
      // محاولة الاتصال بـ PostgreSQL أولاً
      const pgConnection = await this.connectToPostgreSQL();
      if (pgConnection) {
        this.currentDb = pgConnection;
        this.currentType = 'postgresql';
        console.log('✅ متصل بـ PostgreSQL (الأساسية)');
        this.isConnecting = false;
        return { db: this.currentDb, type: this.currentType };
      }
    } catch (error) {
      console.warn('⚠️ فشل الاتصال بـ PostgreSQL:', error.message);
    }

    try {
      // محاولة الاتصال بـ MySQL كبديل
      const mysqlConnection = await this.connectToMySQL();
      if (mysqlConnection) {
        this.currentDb = mysqlConnection;
        this.currentType = 'mysql';
        console.log('🔄 متصل بـ MySQL (الاحتياطية)');
        this.isConnecting = false;
        return { db: this.currentDb, type: this.currentType };
      }
    } catch (error) {
      console.error('❌ فشل الاتصال بـ MySQL:', error.message);
    }

    this.isConnecting = false;
    throw new Error('فشل الاتصال بجميع قواعد البيانات');
  }

  /**
   * اختبار اتصال قاعدة البيانات
   */
  private async testConnection(db: DatabaseInstance, type: DatabaseType): Promise<void> {
    try {
      if (type === 'postgresql') {
        await db.execute(`SELECT 1 as test`);
      } else {
        await db.execute(`SELECT 1 as test`);
      }
    } catch (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
  }

  /**
   * الاتصال بـ PostgreSQL
   */
  private async connectToPostgreSQL(): Promise<NeonDatabase<typeof schema> | null> {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL غير محدد');
      }

      this.pgPool = new NeonPool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000 // مهلة زمنية قصيرة للاختبار السريع
      });
      
      const db = drizzlePg({ client: this.pgPool, schema });
      
      // اختبار الاتصال
      await db.execute(`SELECT 1 as test`);
      
      return db;
    } catch (error) {
      if (this.pgPool) {
        await this.pgPool.end();
        this.pgPool = null;
      }
      throw error;
    }
  }

  /**
   * الاتصال بـ MySQL
   */
  private async connectToMySQL(): Promise<MySql2Database<typeof schema> | null> {
    try {
      const mysqlConfig = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'maritime_platform',
        connectionLimit: 10,
        acquireTimeout: 5000,
        timeout: 5000,
        reconnect: true,
        multipleStatements: true
      };

      this.mysqlPool = mysql.createPool(mysqlConfig);
      
      const db = drizzleMysql(this.mysqlPool, { schema, mode: 'default' });
      
      // اختبار الاتصال
      await db.execute(`SELECT 1 as test`);
      
      // إنشاء الجداول إذا لم تكن موجودة
      await this.createMySQLTables(db);
      
      return db;
    } catch (error) {
      if (this.mysqlPool) {
        await this.mysqlPool.end();
        this.mysqlPool = null;
      }
      throw error;
    }
  }

  /**
   * إنشاء جداول MySQL إذا لم تكن موجودة
   */
  private async createMySQLTables(db: MySql2Database<typeof schema>): Promise<void> {
    try {
      console.log('🔧 إنشاء جداول MySQL...');
      
      // إنشاء جدول المستخدمين
      await db.execute(`
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
      await db.execute(`
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
          current_lat DECIMAL(10, 8),
          current_lng DECIMAL(11, 8),
          destination VARCHAR(255),
          eta TIMESTAMP NULL,
          status VARCHAR(50),
          speed DECIMAL(5, 2),
          course DECIMAL(5, 2),
          draught DECIMAL(5, 2),
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
          INDEX idx_status (status),
          INDEX idx_position (current_lat, current_lng)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // إنشاء جدول المصافي
      await db.execute(`
        CREATE TABLE IF NOT EXISTS refineries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          country VARCHAR(255) NOT NULL,
          region VARCHAR(255) NOT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          capacity INT,
          status VARCHAR(50),
          type VARCHAR(50),
          operator VARCHAR(255),
          owner VARCHAR(255),
          products TEXT,
          year_built INT,
          last_maintenance TIMESTAMP NULL,
          next_maintenance TIMESTAMP NULL,
          complexity DECIMAL(10, 2),
          email VARCHAR(255),
          phone VARCHAR(50),
          website VARCHAR(255),
          address TEXT,
          technical_specs TEXT,
          photo VARCHAR(255),
          city VARCHAR(255),
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          utilization DECIMAL(10, 2),
          INDEX idx_region (region),
          INDEX idx_status (status),
          INDEX idx_position (lat, lng)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // إنشاء جدول الموانئ
      await db.execute(`
        CREATE TABLE IF NOT EXISTS ports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          country VARCHAR(255) NOT NULL,
          region VARCHAR(255) NOT NULL,
          lat DECIMAL(10, 8) NOT NULL,
          lng DECIMAL(11, 8) NOT NULL,
          type VARCHAR(50),
          status VARCHAR(50),
          capacity INT,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          description TEXT,
          INDEX idx_region (region),
          INDEX idx_type (type),
          INDEX idx_position (lat, lng)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // إنشاء جدول خطط الاشتراك
      await db.execute(`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          billing_interval VARCHAR(50) NOT NULL,
          features JSON,
          stripe_price_id VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // إنشاء جدول الإحصائيات
      await db.execute(`
        CREATE TABLE IF NOT EXISTS stats (
          id INT AUTO_INCREMENT PRIMARY KEY,
          active_vessels INT DEFAULT 0,
          total_cargo VARCHAR(255) DEFAULT '0',
          active_refineries INT DEFAULT 0,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('✅ تم إنشاء جداول MySQL بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء جداول MySQL:', error);
      throw error;
    }
  }

  /**
   * انتظار انتهاء محاولة الاتصال
   */
  private async waitForConnection(): Promise<void> {
    let attempts = 0;
    while (this.isConnecting && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  /**
   * إغلاق جميع الاتصالات
   */
  async closeAll(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
      this.pgPool = null;
    }
    if (this.mysqlPool) {
      await this.mysqlPool.end();
      this.mysqlPool = null;
    }
    this.currentDb = null;
    this.currentType = null;
  }

  /**
   * الحصول على نوع قاعدة البيانات الحالية
   */
  getCurrentDatabaseType(): DatabaseType | null {
    return this.currentType;
  }

  /**
   * فرض إعادة الاتصال
   */
  async forceReconnect(): Promise<{ db: DatabaseInstance; type: DatabaseType }> {
    await this.closeAll();
    return await this.getDatabase();
  }
}

// تصدير instance واحد للاستخدام في جميع أنحاء التطبيق
export const dbSwitcher = new DatabaseSwitcher();