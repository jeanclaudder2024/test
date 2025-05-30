import { Request, Response, NextFunction, Express } from 'express';
import { supabase } from './supabase';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Simple user registration
export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, username } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, user: data.user });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

// Simple user login
export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, user: data.user, session: data.session });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
}

// Logout user
export async function logoutUser(req: Request, res: Response) {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
}

// Authentication middleware
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Setup authentication routes
export function setupSupabaseAuth(app: Express) {
  app.post('/api/auth/register', registerUser);
  app.post('/api/auth/login', loginUser);
  app.get('/api/auth/user', getCurrentUser);
  app.post('/api/auth/logout', logoutUser);
  
  console.log('Supabase authentication routes configured');
}