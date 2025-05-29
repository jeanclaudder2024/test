import { createClient } from '@supabase/supabase-js';
import type { Express, Request, Response, NextFunction } from 'express';
import type { User, InsertUser, UpdateUser } from '@shared/schema';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Middleware to verify JWT token and get user info
export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // If user doesn't exist in our users table, create them
    if (!userData) {
      const newUser: InsertUser = {
        id: user.id,
        email: user.email || '',
        firstName: user.user_metadata?.first_name || null,
        lastName: user.user_metadata?.last_name || null,
        profileImageUrl: user.user_metadata?.avatar_url || null,
        emailVerified: user.email_confirmed_at ? true : false,
        role: 'user',
        subscriptionPlan: 'free',
        subscriptionStatus: 'inactive'
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      req.user = createdUser;
    } else {
      req.user = userData;
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check subscription status
export const requireActiveSubscription = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const hasActiveSubscription = req.user.subscriptionStatus === 'active' || req.user.role === 'admin';
  if (!hasActiveSubscription) {
    return res.status(403).json({ error: 'Active subscription required' });
  }

  next();
};

// Check if user has access to premium features
export const requirePremiumPlan = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const hasPremiumAccess = req.user.subscriptionPlan === 'premium' || 
                          req.user.subscriptionPlan === 'enterprise' || 
                          req.user.role === 'admin';
  
  if (!hasPremiumAccess) {
    return res.status(403).json({ error: 'Premium subscription required' });
  }

  next();
};

// User management functions
export const updateUserProfile = async (userId: string, updates: UpdateUser): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updatedAt: new Date() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

export const updateUserSubscription = async (
  userId: string, 
  subscriptionData: {
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }
): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        ...subscriptionData, 
        updatedAt: new Date() 
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, role: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updatedAt: new Date() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
};

export { supabase };