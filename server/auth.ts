import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users, userSubscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Calculate trial end date (3 days from now)
export function calculateTrialEndDate(): Date {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 3);
  return endDate;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    subscription?: {
      trialStartDate: Date;
      trialEndDate: Date;
      isActive: boolean;
    };
  };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: any): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Authentication middleware
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Try to get token from Authorization header first, then from cookies
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If no Authorization header, try to get from cookies
  if (!token && req.cookies) {
    token = req.cookies.authToken;
  }

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    // Fetch user with subscription
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Fetch subscription (optional)
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, user.id))
      .limit(1);

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      hasBrokerMembership: user.hasBrokerMembership || false,
      brokerMembershipDate: user.brokerMembershipDate || null,
      subscription: subscription || undefined
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Admin middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Trial check middleware
export function checkTrialStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.subscription) {
    return res.status(403).json({ message: 'No subscription found' });
  }

  const now = new Date();
  const trialEndDate = new Date(req.user.subscription.trialEndDate);

  if (now > trialEndDate && !req.user.subscription.isActive) {
    return res.status(403).json({ 
      message: 'Trial expired',
      trialExpired: true,
      trialEndDate: trialEndDate.toISOString()
    });
  }

  next();
}

