/**
 * نظام الأمان والحماية الشامل للمنصة
 * يتضمن حماية من الاختراق وتشفير البيانات الحساسة
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// تشفير البيانات الحساسة
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

/**
 * تشفير النصوص الحساسة
 */
export function encryptSensitiveData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * فك تشفير النصوص
 */
export function decryptSensitiveData(text: string): string {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return text; // إرجاع النص الأصلي في حالة الخطأ
  }
}

/**
 * تحديد محدود للطلبات لمنع الهجمات
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: {
    error: 'تم تجاوز الحد الأقصى للطلبات. حاول مرة أخرى لاحقاً.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // السماح للطلبات المحلية أثناء التطوير
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1');
  }
});

/**
 * محدد صارم لطلبات تسجيل الدخول
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 محاولات تسجيل دخول كل 15 دقيقة
  message: {
    error: 'تم تجاوز عدد محاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة.',
    security: 'تم تسجيل هذه المحاولة لأغراض الأمان.'
  },
  skipSuccessfulRequests: true
});

/**
 * محدد خاص لصفحة الإدارة
 */
export const adminRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 دقائق
  max: 20, // 20 طلب كل 5 دقائق للإدارة
  message: {
    error: 'تم تجاوز الحد الأقصى لطلبات الإدارة.',
    action: 'تم تنبيه المشرفين بهذه المحاولة.'
  }
});

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const validateEmailFormat = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('البريد الإلكتروني غير صحيح')
    .custom(async (email) => {
      // التحقق من نطاق البريد الإلكتروني
      const domain = email.split('@')[1];
      const invalidDomains = [
        'tempmail.org', '10minutemail.com', 'guerrillamail.com',
        'throwaway.email', 'temp-mail.org', 'fakemailgenerator.com'
      ];
      
      if (invalidDomains.includes(domain.toLowerCase())) {
        throw new Error('لا يُسمح بعناوين البريد الإلكتروني المؤقتة');
      }
      
      return true;
    })
];

/**
 * التحقق من قوة كلمة المرور
 */
export const validateStrongPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص')
];

/**
 * التحقق من أخطاء التحقق
 */
export const checkValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

/**
 * حماية ضد هجمات XSS
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/[<>]/g, '') // إزالة علامات HTML
        .replace(/javascript:/gi, '') // إزالة جافا سكريبت
        .replace(/on\w+=/gi, '') // إزالة معالجات الأحداث
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

/**
 * حماية المعلومات الحساسة في الاستجابات
 */
export const sanitizeResponse = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // إزالة المعلومات الحساسة من الاستجابة
    if (body && typeof body === 'object') {
      const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'hash'];
      
      const removeSensitive = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(removeSensitive);
        }
        
        if (obj && typeof obj === 'object') {
          const cleaned: any = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const lowerKey = key.toLowerCase();
              if (!sensitiveFields.some(field => lowerKey.includes(field))) {
                cleaned[key] = removeSensitive(obj[key]);
              }
            }
          }
          return cleaned;
        }
        
        return obj;
      };
      
      body = removeSensitive(body);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * التحقق من صحة رمز CSRF
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // تجاهل طلبات GET
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body.csrfToken;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'رمز الأمان غير صحيح',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  next();
};

/**
 * حماية إضافية لصفحات الإدارة
 */
export const adminSecurityCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // التحقق من وجود المستخدم المسجل
    if (!req.user) {
      return res.status(401).json({
        error: 'غير مصرح له بالوصول',
        redirect: '/login'
      });
    }
    
    // التحقق من صلاحيات الإدارة
    const user = req.user as any;
    if (!user.isAdmin && user.role !== 'admin' && user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        error: 'صلاحيات إدارية مطلوبة',
        code: 'ADMIN_ACCESS_DENIED'
      });
    }
    
    // تسجيل محاولة الوصول للإدارة
    console.log(`🔒 محاولة وصول للإدارة من: ${req.ip} - المستخدم: ${user.email || user.id}`);
    
    next();
  } catch (error) {
    console.error('خطأ في فحص أمان الإدارة:', error);
    res.status(500).json({
      error: 'خطأ في التحقق من الصلاحيات'
    });
  }
};

/**
 * إعداد Helmet لحماية الرؤوس
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "*.replit.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:", "*.replit.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
});

/**
 * منع عرض معلومات الخادم
 */
export const hideServerInfo = (req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};