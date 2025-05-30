/**
 * Professional MySQL Authentication Routes - Oil Vessel Tracking
 * Secure registration, login, and user profile management with MySQL
 */

import express from 'express';
import session from 'express-session';
import { 
  initializeUsersTable,
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  generateToken 
} from './mysql-auth-integration.js';

const router = express.Router();

// Initialize users table on startup
initializeUsersTable().catch(console.error);

// Session configuration
export function setupAuthSession(app) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'oil-vessel-tracking-session-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
}

// Professional User Registration
router.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', { username: req.body.username, email: req.body.email });
    
    const { username, email, password, firstName, lastName, company, phone } = req.body;

    // Register user using MySQL integration
    const newUser = await registerUser({
      username,
      email,
      password,
      firstName,
      lastName,
      company,
      phone
    });
    
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
    
    console.log('✅ Registration successful for:', newUser.username);
    
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
    console.error('❌ Registration error:', error.message);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Professional User Login
router.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { emailOrUsername: req.body.emailOrUsername || req.body.username });
    
    const { emailOrUsername, username, password, rememberMe } = req.body;
    const loginIdentifier = emailOrUsername || username;

    // Login user using MySQL integration
    const user = await loginUser(loginIdentifier, password);
    
    // Generate JWT token
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
      message: error.message || 'Login failed. Please try again.',
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
    
    const user = await getUserProfile(req.session.user.id);
    
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
    console.error('❌ Profile fetch error:', error);
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
    
    const updatedUser = await updateUserProfile(req.session.user.id, {
      firstName,
      lastName,
      company,
      phone
    });
    
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

// Check authentication status
router.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
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

export { router as authRoutes, setupAuthSession };