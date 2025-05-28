/**
 * Professional MySQL Authentication Integration - Oil Vessel Tracking
 * Secure authentication system using your existing MySQL database
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'oil-vessel-tracking-secret-2024';
const SALT_ROUNDS = 12;

// MySQL connection configuration
const dbConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig);

// Database query helper
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize users table if it doesn't exist
export async function initializeUsersTable() {
  try {
    await executeQuery(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Users table initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing users table:', error);
    throw error;
  }
}

// Hash password securely
export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Password hashing failed');
  }
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Password verification failed');
  }
}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Validation functions
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return errors;
}

export function validateUsername(username) {
  const errors = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
  }
  
  return errors;
}

// Register new user
export async function registerUser(userData) {
  const { username, email, password, firstName, lastName, company, phone } = userData;

  // Validate input data
  const validationErrors = [];
  
  if (!username || !email || !password) {
    validationErrors.push('Username, email, and password are required');
  }
  
  if (!validateEmail(email)) {
    validationErrors.push('Please provide a valid email address');
  }
  
  const usernameErrors = validateUsername(username);
  const passwordErrors = validatePassword(password);
  
  validationErrors.push(...usernameErrors, ...passwordErrors);
  
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(', '));
  }

  // Check if user already exists
  const existingUsers = await executeQuery(
    'SELECT id, email, username FROM users WHERE email = ? OR username = ?', 
    [email, username]
  );
  
  if (existingUsers.length > 0) {
    const existingUser = existingUsers[0];
    if (existingUser.email === email) {
      throw new Error('An account with this email already exists');
    }
    if (existingUser.username === username) {
      throw new Error('This username is already taken');
    }
  }

  // Hash password securely
  const hashedPassword = await hashPassword(password);
  
  // Create user in database
  await executeQuery(`
    INSERT INTO users (
      username, email, password, first_name, last_name, 
      company, phone, created_at, is_active, email_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1, 0)
  `, [username, email, hashedPassword, firstName || null, lastName || null, company || null, phone || null]);
  
  // Get the created user
  const [newUser] = await executeQuery(
    'SELECT id, username, email, first_name, last_name, company, phone, created_at FROM users WHERE email = ?', 
    [email]
  );
  
  return newUser;
}

// Login user
export async function loginUser(emailOrUsername, password) {
  if (!emailOrUsername || !password) {
    throw new Error('Email/username and password are required');
  }

  // Find user by email or username
  const users = await executeQuery(`
    SELECT id, username, email, password, first_name, last_name, 
           company, phone, is_active, email_verified, last_login 
    FROM users 
    WHERE (email = ? OR username = ?) AND is_active = 1
  `, [emailOrUsername, emailOrUsername]);
  
  if (users.length === 0) {
    throw new Error('Invalid credentials. Please check your email/username and password.');
  }
  
  const user = users[0];
  
  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);
  
  if (!isValidPassword) {
    throw new Error('Invalid credentials. Please check your email/username and password.');
  }
  
  // Update last login
  await executeQuery('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
  
  return user;
}

// Get user profile
export async function getUserProfile(userId) {
  const [user] = await executeQuery(`
    SELECT id, username, email, first_name, last_name, company, 
           phone, created_at, last_login, email_verified, is_active 
    FROM users WHERE id = ?
  `, [userId]);
  
  return user;
}

// Update user profile
export async function updateUserProfile(userId, userData) {
  const { firstName, lastName, company, phone } = userData;
  
  await executeQuery(`
    UPDATE users 
    SET first_name = ?, last_name = ?, company = ?, phone = ?, updated_at = NOW()
    WHERE id = ?
  `, [firstName || null, lastName || null, company || null, phone || null, userId]);
  
  return await getUserProfile(userId);
}

export { executeQuery };