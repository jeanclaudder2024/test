/**
 * Professional Supabase Authentication System
 * Oil Vessel Tracking Platform - Enterprise Security
 */

import { supabase, supabaseAdmin } from './supabase';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * User Registration with Supabase Auth
 */
export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, companyId } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Use Supabase Admin client to create user without email confirmation
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName || null,
        last_name: lastName || null,
        company_id: companyId || null
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({
        success: false,
        error: `Registration failed: ${authError.message}`
      });
    }

    // Create user profile in the users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authUser.user.id,
        email: authUser.user.email,
        first_name: firstName || '',
        last_name: lastName || '',
        company_id: companyId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Profile creation error:', dbError);
      // Still return success since auth user was created successfully
    }

    return res.json({
      success: true,
      message: 'Registration successful! You can now log in to access your oil vessel tracking dashboard.',
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        firstName: firstName,
        lastName: lastName
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
}

/**
 * User Login with Supabase Auth
 */
export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Get user profile
    let userProfile = null;
    if (data.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      userProfile = profile;
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session,
      profile: userProfile,
      message: 'Login successful! Welcome to your oil vessel tracking dashboard.',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
}

/**
 * User Logout
 */
export async function logoutUser(req: Request, res: Response) {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
    }

    res.json({
      success: true,
      message: 'Logout successful!'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
}

/**
 * Get Current User
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*, companies(name)')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile: profile || null,
      },
    });
  } catch (error: any) {
    console.error('User fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
}

/**
 * Password Reset Request
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.protocol}://${req.get('host')}/reset-password-confirm`,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
}

/**
 * Authentication Middleware
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Refresh Session
 */
export async function refreshSession(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      session: data.session,
      user: data.user,
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Session refresh failed'
    });
  }
}

/**
 * Update User Profile
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const { firstName, lastName, companyId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Update user profile in database
    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        company_id: companyId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      profile: data,
      message: 'Profile updated successfully!',
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile update failed'
    });
  }
}

/**
 * Setup authentication routes
 */
export function supabaseAuthRoutes(app: any) {
  // Authentication routes
  app.post('/api/auth/register', registerUser);
  app.post('/api/auth/login', loginUser);
  app.post('/api/auth/logout', logoutUser);
  app.get('/api/auth/user', getCurrentUser);
  app.post('/api/auth/reset-password', resetPassword);
  app.post('/api/auth/refresh', refreshSession);
  app.post('/api/auth/update-profile', requireAuth, updateProfile);
}