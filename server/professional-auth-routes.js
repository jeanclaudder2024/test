/**
 * Professional Authentication Routes - Oil Vessel Tracking
 * Secure registration, login, and user profile management
 */

import express from 'express';
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken,
  validateEmail, 
  validatePassword, 
  validateUsername 
} from './auth-system.js';

const router = express.Router();

// Database query helper (using your MySQL connection)
async function executeQuery(sql, params = []) {
  // This will use your existing MySQL connection
  const mysql = await import('mysql2/promise');
  const connection = mysql.createConnection({
    host: 'sql301.infinityfree.com',
    user: 'u150634185_A99wL',
    password: 'jonny@2025@',
    database: 'u150634185_oiltrak',
    port: 3306
  });
  
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    await connection.end();
  }
}

// Professional User Registration
router.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, company, phone } = req.body;

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
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if user already exists
    const existingUsers = await executeQuery(
      'SELECT id, email, username FROM users WHERE email = ? OR username = ?', 
      [email, username]
    );
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }
      if (existingUser.username === username) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken'
        });
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
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    // Set secure session
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      company: newUser.company
    };
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to the maritime oil trading platform.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        company: newUser.company,
        phone: newUser.phone
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed due to server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Professional User Login
router.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password, rememberMe } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    // Find user by email or username
    const users = await executeQuery(`
      SELECT id, username, email, password, first_name, last_name, 
             company, phone, is_active, email_verified, last_login 
      FROM users 
      WHERE (email = ? OR username = ?) AND is_active = 1
    `, [emailOrUsername, emailOrUsername]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/username and password.'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/username and password.'
      });
    }
    
    // Update last login
    await executeQuery('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = generateToken(user);
    
    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company
    };
    
    // Set session expiry based on remember me
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get User Profile
router.get('/api/auth/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access your profile'
      });
    }
    
    const [user] = await executeQuery(`
      SELECT id, username, email, first_name, last_name, company, 
             phone, created_at, last_login, email_verified, is_active 
      FROM users WHERE id = ?
    `, [req.session.user.id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }
    
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
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile data'
    });
  }
});

// Update User Profile
router.put('/api/auth/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to update your profile'
      });
    }
    
    const { firstName, lastName, company, phone } = req.body;
    
    await executeQuery(`
      UPDATE users 
      SET first_name = ?, last_name = ?, company = ?, phone = ?, updated_at = NOW()
      WHERE id = ?
    `, [firstName || null, lastName || null, company || null, phone || null, req.session.user.id]);
    
    // Update session data
    req.session.user = {
      ...req.session.user,
      firstName,
      lastName,
      company
    };
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.session.user
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Professional Logout
router.post('/api/auth/logout', (req, res) => {
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
});

export default router;