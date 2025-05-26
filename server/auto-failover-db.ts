/**
 * نظام التبديل التلقائي الذكي لقاعدة البيانات
 * يتحول تلقائياً من PostgreSQL إلى MySQL عند حدوث مشاكل
 */

import { primaryDb, tertiaryDb } from "./db";
import { vessels, ports, refineries, users } from "../shared/schema";

class AutoFailoverDatabase {
  private isFailoverActive = false;
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000; // 30 ثانية
  private currentDatabase: 'primary' | 'mysql' = 'primary';
  private failoverAttempts = 0;
  private maxFailoverAttempts = 3;

  constructor() {
    console.log('🔄 تم تفعيل نظام التبديل التلقائي لقاعدة البيانات');
    this.startHealthMonitoring();
  }

  /**
   * بدء مراقبة صحة قاعدة البيانات
   */
  private startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  /**
   * فحص صحة قاعدة البيانات
   */
  private async performHealthCheck() {
    try {
      this.lastHealthCheck = Date.now();
      
      if (this.currentDatabase === 'primary') {
        // اختبار قاعدة البيانات الرئيسية
        await primaryDb.select().from(vessels).limit(1);
        
        // إذا كانت تعمل بعد failover، اعتبرها متاحة مرة أخرى
        if (this.isFailoverActive) {
          console.log('✅ قاعدة البيانات الرئيسية متاحة مرة أخرى');
          this.isFailoverActive = false;
          this.failoverAttempts = 0;
        }
      } else if (this.currentDatabase === 'mysql') {
        // اختبار قاعدة MySQL
        await tertiaryDb.select().from(vessels).limit(1);
      }
    } catch (error) {
      console.error('❌ فشل في فحص صحة قاعدة البيانات:', error);
      await this.handleDatabaseFailure();
    }
  }

  /**
   * التعامل مع فشل قاعدة البيانات
   */
  private async handleDatabaseFailure() {
    if (this.failoverAttempts >= this.maxFailoverAttempts) {
      console.error('🚨 تم الوصول للحد الأقصى من محاولات التبديل');
      return;
    }

    this.failoverAttempts++;
    
    if (this.currentDatabase === 'primary' && tertiaryDb) {
      console.log('🔄 التحول إلى قاعدة بيانات MySQL...');
      this.currentDatabase = 'mysql';
      this.isFailoverActive = true;
      
      try {
        // اختبار قاعدة MySQL
        await tertiaryDb.select().from(vessels).limit(1);
        console.log('✅ تم التحول بنجاح إلى قاعدة MySQL');
      } catch (mysqlError) {
        console.error('❌ فشل في الاتصال بقاعدة MySQL أيضاً:', mysqlError);
        this.currentDatabase = 'primary'; // العودة للرئيسية
      }
    }
  }

  /**
   * تنفيذ عملية قاعدة بيانات مع التبديل التلقائي
   */
  async executeWithFailover<T>(operation: (db: any) => Promise<T>): Promise<T> {
    try {
      // محاولة استخدام قاعدة البيانات الحالية
      const db = this.currentDatabase === 'mysql' ? tertiaryDb : primaryDb;
      return await operation(db);
    } catch (error) {
      console.error('❌ فشل في العملية مع قاعدة البيانات الحالية:', error);
      
      // محاولة التبديل
      if (this.currentDatabase === 'primary' && tertiaryDb) {
        console.log('🔄 محاولة التبديل إلى MySQL...');
        try {
          this.currentDatabase = 'mysql';
          this.isFailoverActive = true;
          return await operation(tertiaryDb);
        } catch (mysqlError) {
          console.error('❌ فشل في MySQL أيضاً:', mysqlError);
          this.currentDatabase = 'primary';
          throw new Error('جميع قواعد البيانات غير متاحة');
        }
      } else if (this.currentDatabase === 'mysql') {
        console.log('🔄 محاولة العودة إلى قاعدة البيانات الرئيسية...');
        try {
          this.currentDatabase = 'primary';
          this.isFailoverActive = false;
          return await operation(primaryDb);
        } catch (primaryError) {
          console.error('❌ قاعدة البيانات الرئيسية لا تزال غير متاحة:', primaryError);
          this.currentDatabase = 'mysql';
          throw error; // إرجاع الخطأ الأصلي
        }
      }
      
      throw error;
    }
  }

  /**
   * الحصول على قاعدة البيانات النشطة
   */
  getActiveDatabase() {
    return this.currentDatabase === 'mysql' ? tertiaryDb : primaryDb;
  }

  /**
   * الحصول على حالة النظام
   */
  getStatus() {
    return {
      currentDatabase: this.currentDatabase,
      isFailoverActive: this.isFailoverActive,
      lastHealthCheck: new Date(this.lastHealthCheck).toISOString(),
      failoverAttempts: this.failoverAttempts,
      maxAttempts: this.maxFailoverAttempts
    };
  }

  /**
   * إجبار التبديل لأغراض الاختبار
   */
  async forceFailover() {
    if (this.currentDatabase === 'primary' && tertiaryDb) {
      console.log('🔄 إجبار التبديل إلى MySQL...');
      this.currentDatabase = 'mysql';
      this.isFailoverActive = true;
      
      try {
        await tertiaryDb.select().from(vessels).limit(1);
        console.log('✅ تم إجبار التبديل بنجاح');
        return true;
      } catch (error) {
        console.error('❌ فشل في إجبار التبديل:', error);
        this.currentDatabase = 'primary';
        return false;
      }
    }
    return false;
  }

  /**
   * إجبار العودة إلى قاعدة البيانات الرئيسية
   */
  async forceRecovery() {
    if (this.currentDatabase === 'mysql') {
      console.log('🔄 إجبار العودة إلى قاعدة البيانات الرئيسية...');
      try {
        await primaryDb.select().from(vessels).limit(1);
        this.currentDatabase = 'primary';
        this.isFailoverActive = false;
        this.failoverAttempts = 0;
        console.log('✅ تم إجبار العودة بنجاح');
        return true;
      } catch (error) {
        console.error('❌ فشل في إجبار العودة:', error);
        return false;
      }
    }
    return false;
  }
}

// إنشاء مثيل وحيد من النظام
export const autoFailoverDb = new AutoFailoverDatabase();

// تصدير دالة مساعدة للاستخدام في Routes
export async function executeDbOperation<T>(operation: (db: any) => Promise<T>): Promise<T> {
  return autoFailoverDb.executeWithFailover(operation);
}

// تصدير دالة للحصول على قاعدة البيانات النشطة
export function getFailoverDatabase() {
  return autoFailoverDb.getActiveDatabase();
}

// تصدير دالة للحصول على حالة النظام
export function getFailoverStatus() {
  return autoFailoverDb.getStatus();
}