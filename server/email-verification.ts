/**
 * نظام التحقق من صحة البريد الإلكتروني وحمايته من الاختراق
 */

import crypto from 'crypto';
import { storage } from './storage';

// قائمة بمقدمي البريد الإلكتروني المؤقت المعروفين
const TEMPORARY_EMAIL_DOMAINS = [
  'tempmail.org', '10minutemail.com', 'guerrillamail.com',
  'throwaway.email', 'temp-mail.org', 'fakemailgenerator.com',
  'mailinator.com', 'yopmail.com', 'maildrop.cc',
  'trashmail.com', 'tempail.com', 'sharklasers.com',
  'getnada.com', 'mohmal.com', 'emailondeck.com'
];

// أسماء شائعة للحسابات المزيفة
const SUSPICIOUS_NAMES = [
  'test', 'admin', 'root', 'user', 'demo', 'example',
  'sample', 'fake', 'null', 'undefined', 'anonymous'
];

/**
 * التحقق من صحة تنسيق البريد الإلكتروني
 */
export function validateEmailFormat(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'تنسيق البريد الإلكتروني غير صحيح' };
  }

  const domain = email.split('@')[1].toLowerCase();
  
  // التحقق من النطاقات المؤقتة
  if (TEMPORARY_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, error: 'لا يُسمح بعناوين البريد الإلكتروني المؤقتة' };
  }

  // التحقق من النطاقات المشبوهة
  if (domain.includes('temp') || domain.includes('fake') || domain.includes('test')) {
    return { valid: false, error: 'نطاق البريد الإلكتروني غير مسموح' };
  }

  return { valid: true };
}

/**
 * التحقق من البيانات الشخصية للمستخدم
 */
export function validateUserData(userData: {
  email: string;
  username?: string;
  name?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // التحقق من البريد الإلكتروني
  const emailCheck = validateEmailFormat(userData.email);
  if (!emailCheck.valid) {
    errors.push(emailCheck.error!);
  }

  // التحقق من اسم المستخدم
  if (userData.username) {
    const username = userData.username.toLowerCase();
    if (SUSPICIOUS_NAMES.some(name => username.includes(name))) {
      errors.push('اسم المستخدم غير مسموح');
    }
    
    if (username.length < 3) {
      errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
      errors.push('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط');
    }
  }

  // التحقق من الاسم
  if (userData.name) {
    const name = userData.name.toLowerCase();
    if (SUSPICIOUS_NAMES.some(suspiciousName => name.includes(suspiciousName))) {
      errors.push('الاسم المدخل غير صحيح');
    }
    
    if (userData.name.length < 2) {
      errors.push('الاسم يجب أن يكون حرفين على الأقل');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * إنشاء رمز تحقق آمن
 */
export function generateVerificationCode(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * التحقق من وجود البريد الإلكتروني مسبقاً
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const existingUser = await storage.getUserByEmail(email);
    return !!existingUser;
  } catch {
    return false;
  }
}

/**
 * تسجيل محاولة مشبوهة للتسجيل
 */
export function logSuspiciousActivity(activity: {
  ip: string;
  email: string;
  reason: string;
  userAgent?: string;
}): void {
  console.warn(`🚨 نشاط مشبوه في التسجيل:`, {
    timestamp: new Date().toISOString(),
    ip: activity.ip,
    email: activity.email,
    reason: activity.reason,
    userAgent: activity.userAgent
  });
}

/**
 * حماية ضد هجمات التسجيل الجماعي
 */
const registrationAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export function checkRegistrationRateLimit(ip: string): { allowed: boolean; remainingTime?: number } {
  const now = new Date();
  const attempt = registrationAttempts.get(ip);
  
  if (!attempt) {
    registrationAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  const timeDiff = now.getTime() - attempt.lastAttempt.getTime();
  const fiveMinutes = 5 * 60 * 1000;
  
  // إعادة تعيين العداد كل 5 دقائق
  if (timeDiff > fiveMinutes) {
    registrationAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // السماح بـ 3 محاولات تسجيل كل 5 دقائق
  if (attempt.count >= 3) {
    const remainingTime = Math.ceil((fiveMinutes - timeDiff) / 1000);
    return { allowed: false, remainingTime };
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  
  return { allowed: true };
}

/**
 * التحقق من قوة كلمة المرور
 */
export function validatePasswordStrength(password: string): { valid: boolean; score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;
  
  // الطول
  if (password.length >= 8) score += 1;
  else feedback.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  
  if (password.length >= 12) score += 1;
  
  // الأحرف الكبيرة والصغيرة
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('يجب أن تحتوي على أحرف صغيرة');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('يجب أن تحتوي على أحرف كبيرة');
  
  // الأرقام
  if (/\d/.test(password)) score += 1;
  else feedback.push('يجب أن تحتوي على أرقام');
  
  // الرموز الخاصة
  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('يجب أن تحتوي على رموز خاصة (@$!%*?&)');
  
  // تجنب الكلمات الشائعة
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score -= 2;
    feedback.push('تجنب استخدام كلمات المرور الشائعة');
  }
  
  return {
    valid: score >= 4 && feedback.length === 0,
    score: Math.max(0, Math.min(6, score)),
    feedback
  };
}

/**
 * تشفير كلمة المرور بشكل آمن
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  return await bcrypt.hash(password, 12); // استخدام salt rounds عالي للأمان
}

/**
 * مقارنة كلمة المرور المشفرة
 */
export async function comparePasswords(suppliedPassword: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return await bcrypt.compare(suppliedPassword, hashedPassword);
}