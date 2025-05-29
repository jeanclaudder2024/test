import { Router } from 'express';
import { 
  authenticateUser, 
  requireAdmin, 
  requireActiveSubscription,
  requirePremiumPlan,
  updateUserProfile,
  updateUserSubscription,
  getAllUsers,
  updateUserRole,
  supabase,
  type AuthenticatedRequest
} from '../supabase-auth';
import type { UpdateUser } from '@shared/schema';

const router = Router();

// Get current user profile
router.get('/user', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/user', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updates: UpdateUser = req.body;
    const updatedUser = await updateUserProfile(req.user.id, updates);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'user', 'premium'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await updateUserRole(userId, role);
    
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user role' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Update user subscription (admin only)
router.put('/users/:userId/subscription', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const subscriptionData = req.body;

    const updatedUser = await updateUserSubscription(userId, subscriptionData);
    
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Get subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('isActive', true)
      .order('sortOrder');

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }

    res.json(plans || []);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Create subscription plan (admin only)
router.post('/subscription-plans', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const planData = req.body;

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert(planData)
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription plan:', error);
      return res.status(500).json({ error: 'Failed to create subscription plan' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({ error: 'Failed to create subscription plan' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;

    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting user from auth:', authError);
    }

    // Delete from our users table
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('Error deleting user from database:', dbError);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Check admin status
router.get('/check-admin', authenticateUser, (req: AuthenticatedRequest, res) => {
  const isAdmin = req.user?.role === 'admin';
  res.json({ isAdmin, user: req.user });
});

// Get user permissions
router.get('/permissions', authenticateUser, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const permissions = {
    isAdmin: req.user.role === 'admin',
    hasActiveSubscription: req.user.subscriptionStatus === 'active' || req.user.role === 'admin',
    hasPremiumAccess: req.user.subscriptionPlan === 'premium' || 
                     req.user.subscriptionPlan === 'enterprise' || 
                     req.user.role === 'admin',
    subscriptionPlan: req.user.subscriptionPlan,
    subscriptionStatus: req.user.subscriptionStatus,
    role: req.user.role
  };

  res.json(permissions);
});

export default router;