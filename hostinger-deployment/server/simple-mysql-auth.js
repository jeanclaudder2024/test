/**
 * Simple MySQL Authentication - Oil Vessel Tracking
 * Direct MySQL integration to fix registration errors
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'oil-vessel-tracking-secret-2024';
const SALT_ROUNDS = 10;

// MySQL connection configuration
const dbConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306
};

// Create connection
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
}

// Initialize users table
export async function initializeAuth() {
  const connection = await getConnection();
  try {
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('✅ Authentication system initialized');
  } catch (error) {
    console.error('❌ Error initializing auth:', error);
  } finally {
    await connection.end();
  }
}

// Register user
export async function registerUser(userData) {
  const connection = await getConnection();
  try {
    const { username, email, password, firstName, lastName, company, phone } = userData;

    // Check if user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      throw new Error('User already exists with this email or username');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [result] = await connection.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, company, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [username, email, hashedPassword, firstName || null, lastName || null, company || null, phone || null]);

    // Get created user
    const [users] = await connection.execute(
      'SELECT id, username, email, first_name, last_name, company, phone, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return users[0];
  } finally {
    await connection.end();
  }
}

// Login user
export async function loginUser(emailOrUsername, password) {
  const connection = await getConnection();
  try {
    const [users] = await connection.execute(`
      SELECT id, username, email, password, first_name, last_name, company, phone, last_login
      FROM users 
      WHERE (email = ? OR username = ?) AND is_active = 1
    `, [emailOrUsername, emailOrUsername]);

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await connection.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    return user;
  } finally {
    await connection.end();
  }
}

// Get user profile
export async function getUserProfile(userId) {
  const connection = await getConnection();
  try {
    const [users] = await connection.execute(`
      SELECT id, username, email, first_name, last_name, company, phone, 
             created_at, last_login, email_verified, is_active
      FROM users WHERE id = ?
    `, [userId]);

    return users[0];
  } finally {
    await connection.end();
  }
}

// Update user profile
export async function updateUserProfile(userId, userData) {
  const connection = await getConnection();
  try {
    const { firstName, lastName, company, phone } = userData;

    await connection.execute(`
      UPDATE users 
      SET first_name = ?, last_name = ?, company = ?, phone = ?, updated_at = NOW()
      WHERE id = ?
    `, [firstName || null, lastName || null, company || null, phone || null, userId]);

    return await getUserProfile(userId);
  } finally {
    await connection.end();
  }
}

// Generate token
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

// Setup authentication routes
export function setupAuthRoutes(app) {
  // Initialize on startup
  initializeAuth().catch(console.error);

  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('📝 Registration attempt for:', req.body.username);
      
      const user = await registerUser(req.body);
      const token = generateToken(user);
      
      // Set session
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company
        };
      }
      
      console.log('✅ Registration successful for:', user.username);
      
      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to the maritime oil trading platform.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company,
          phone: user.phone
        },
        token
      });
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('🔐 Login attempt for:', username);
      
      const user = await loginUser(username, password);
      const token = generateToken(user);
      
      // Set session
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company
        };
      }
      
      console.log('✅ Login successful for:', user.username);
      
      res.json({
        success: true,
        message: 'Login successful! Welcome back to your maritime trading platform.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company,
          phone: user.phone,
          lastLogin: user.last_login
        },
        token
      });
    } catch (error) {
      console.error('❌ Login error:', error.message);
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  });

  // Profile endpoint
  app.get('/api/auth/profile', async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({
          success: false,
          message: 'Please log in to access your profile'
        });
      }

      const user = await getUserProfile(req.session.user.id);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company,
          phone: user.phone,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          emailVerified: user.email_verified,
          isActive: user.is_active
        }
      });
    } catch (error) {
      console.error('❌ Profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  });

  // Update profile endpoint
  app.put('/api/auth/profile', async (req, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({
          success: false,
          message: 'Please log in to update profile'
        });
      }

      const updatedUser = await updateUserProfile(req.session.user.id, req.body);
      
      // Update session
      req.session.user = {
        ...req.session.user,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company
      };
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          company: updatedUser.company,
          phone: updatedUser.phone
        }
      });
    } catch (error) {
      console.error('❌ Profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Logout failed'
          });
        }
        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logged out successfully'
        });
      });
    } else {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  });

  // Check auth status
  app.get('/api/auth/me', (req, res) => {
    if (req.session?.user) {
      res.json({
        success: true,
        user: req.session.user
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
  });
}