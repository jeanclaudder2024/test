/**
 * Supabase Authentication System - Oil Vessel Tracking Platform
 * Clean, modern authentication with email login/signup
 */

import { supabase } from './supabase';
import express from 'express';

const router = express.Router();

// User registration with email
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    res.json({
      success: true,
      message: 'Registration successful! Please check your email for verification.',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        firstName,
        lastName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User login with email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Store session info for the user
    req.session.user = {
      id: authData.user.id,
      email: authData.user.email,
      firstName: authData.user.user_metadata?.first_name,
      lastName: authData.user.user_metadata?.last_name
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: req.session.user,
      token: authData.session?.access_token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User logout
router.post('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.json({
        success: true,
        message: 'Logout successful'
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/user', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      user: req.session.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Middleware to check authentication
export function requireAuth(req: any, res: any, next: any) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
}

export { router as supabaseAuthRoutes };