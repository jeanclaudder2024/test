/**
 * Professional Email Authentication System - Oil Vessel Tracking
 * Enterprise-level security with email verification and OTP codes
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import speakeasy from 'speakeasy';

const JWT_SECRET = 'oil-vessel-tracking-professional-2024';
const SALT_ROUNDS = 12;

// MySQL connection configuration
const dbConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306
};

// Professional email transporter (using Gmail - completely free)
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Create connection
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
}

// Initialize professional authentication tables
export async function initializeProfessionalAuth() {
  const connection = await getConnection();
  try {
    // Users table with email verification
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        company VARCHAR(100),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        verification_expires TIMESTAMP NULL,
        failed_login_attempts INT DEFAULT 0,
        account_locked_until TIMESTAMP NULL,
        two_factor_enabled BOOLEAN DEFAULT false,
        two_factor_secret VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        last_login_ip VARCHAR(45),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_verification_token (verification_token),
        INDEX idx_password_reset_token (password_reset_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // OTP codes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(100) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        purpose ENUM('email_verification', 'login_verification', 'password_reset') NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_email_otp (email, otp_code),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Login attempts table for security
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        success BOOLEAN NOT NULL,
        attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        INDEX idx_email_ip (email, ip_address),
        INDEX idx_attempt_time (attempt_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Professional authentication system initialized');
  } catch (error) {
    console.error('❌ Error initializing professional auth:', error);
  } finally {
    await connection.end();
  }
}

// Generate secure OTP code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate secure verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send professional email
async function sendProfessionalEmail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: {
        name: 'PetroDealHub Maritime Platform',
        address: process.env.EMAIL_USER || 'noreply@petrodealhub.com'
      },
      to,
      subject,
      html: htmlContent
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Professional email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

// Professional email templates
function getWelcomeEmailTemplate(username, otpCode) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #003366, #0066cc); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: #fff; border: 2px solid #0066cc; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #003366; letter-spacing: 3px; }
        .button { background: #FF6F00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚢 Welcome to PetroDealHub</h1>
          <p>Professional Maritime Oil Trading Platform</p>
        </div>
        <div class="content">
          <h2>Welcome aboard, ${username}!</h2>
          <p>Thank you for joining the world's most advanced maritime oil trading platform. To complete your registration and ensure account security, please verify your email address.</p>
          
          <div class="otp-box">
            <h3>Your Verification Code</h3>
            <div class="otp-code">${otpCode}</div>
            <p><strong>This code expires in 10 minutes</strong></p>
          </div>
          
          <p>Enter this code in the verification screen to activate your account and start accessing:</p>
          <ul>
            <li>✅ Real-time vessel tracking across global shipping routes</li>
            <li>✅ Advanced oil trading analytics and market insights</li>
            <li>✅ Secure document generation and contract management</li>
            <li>✅ Professional networking with maritime industry leaders</li>
          </ul>
          
          <p><strong>Security Notice:</strong> This email was sent to verify your identity. If you didn't create an account with PetroDealHub, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 PetroDealHub Maritime Platform - Professional Oil Trading Solutions</p>
          <p>This is an automated security email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getLoginOTPTemplate(username, otpCode, ipAddress) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #003366, #0066cc); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: #fff; border: 2px solid #FF6F00; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #FF6F00; letter-spacing: 3px; }
        .security-info { background: #e8f4fd; border-left: 4px solid #0066cc; padding: 15px; margin: 15px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Secure Login Verification</h1>
          <p>PetroDealHub Maritime Platform</p>
        </div>
        <div class="content">
          <h2>Hello ${username},</h2>
          <p>A login attempt was made to your PetroDealHub account. For your security, please verify this login with the code below:</p>
          
          <div class="otp-box">
            <h3>Your Login Verification Code</h3>
            <div class="otp-code">${otpCode}</div>
            <p><strong>This code expires in 5 minutes</strong></p>
          </div>
          
          <div class="security-info">
            <h4>🛡️ Security Information:</h4>
            <p><strong>Login IP Address:</strong> ${ipAddress}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>If this wasn't you, please secure your account immediately and contact support.</p>
          </div>
          
          <p>Enter this code to complete your secure login to the maritime trading platform.</p>
        </div>
        <div class="footer">
          <p>© 2025 PetroDealHub Maritime Platform - Professional Oil Trading Solutions</p>
          <p>This is an automated security email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Validate email format with professional standards
function validateProfessionalEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Check basic format
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  // Block temporary/disposable email services for professional use
  const disposableEmailDomains = [
    '10minutemail.com', 'guerrillamail.com', 'tempmail.org', 
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  if (disposableEmailDomains.includes(domain)) {
    return { valid: false, message: 'Please use a professional email address. Temporary email services are not allowed.' };
  }
  
  return { valid: true, message: 'Valid professional email' };
}

// Validate password strength for professional accounts
function validateProfessionalPassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
}

// Check for too many failed login attempts
async function checkLoginAttempts(email, ipAddress) {
  const connection = await getConnection();
  try {
    const [attempts] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM login_attempts 
      WHERE (email = ? OR ip_address = ?) 
      AND success = false 
      AND attempt_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `, [email, ipAddress]);
    
    return attempts[0].count < 5; // Allow 5 failed attempts in 15 minutes
  } finally {
    await connection.end();
  }
}

// Record login attempt
async function recordLoginAttempt(email, ipAddress, success, userAgent) {
  const connection = await getConnection();
  try {
    await connection.execute(`
      INSERT INTO login_attempts (email, ip_address, success, user_agent) 
      VALUES (?, ?, ?, ?)
    `, [email, ipAddress, success, userAgent]);
  } catch (error) {
    console.error('Error recording login attempt:', error);
  } finally {
    await connection.end();
  }
}

// Store OTP code
async function storeOTPCode(email, otpCode, purpose, userId = null) {
  const connection = await getConnection();
  try {
    // Clean up expired OTP codes
    await connection.execute(`
      DELETE FROM otp_codes 
      WHERE expires_at < NOW() OR (email = ? AND purpose = ?)
    `, [email, purpose]);
    
    // Store new OTP
    const expiresAt = new Date(Date.now() + (purpose === 'email_verification' ? 10 : 5) * 60 * 1000);
    
    await connection.execute(`
      INSERT INTO otp_codes (user_id, email, otp_code, purpose, expires_at) 
      VALUES (?, ?, ?, ?, ?)
    `, [userId, email, otpCode, purpose, expiresAt]);
    
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  } finally {
    await connection.end();
  }
}

// Verify OTP code
async function verifyOTPCode(email, otpCode, purpose) {
  const connection = await getConnection();
  try {
    const [otps] = await connection.execute(`
      SELECT * FROM otp_codes 
      WHERE email = ? AND otp_code = ? AND purpose = ? 
      AND expires_at > NOW() AND used = false
      ORDER BY created_at DESC LIMIT 1
    `, [email, otpCode, purpose]);
    
    if (otps.length === 0) {
      return { valid: false, message: 'Invalid or expired verification code' };
    }
    
    // Mark OTP as used
    await connection.execute(`
      UPDATE otp_codes SET used = true WHERE id = ?
    `, [otps[0].id]);
    
    return { valid: true, otp: otps[0] };
  } finally {
    await connection.end();
  }
}

export {
  getConnection,
  sendProfessionalEmail,
  getWelcomeEmailTemplate,
  getLoginOTPTemplate,
  validateProfessionalEmail,
  validateProfessionalPassword,
  checkLoginAttempts,
  recordLoginAttempt,
  storeOTPCode,
  verifyOTPCode,
  generateOTP,
  generateVerificationToken
};