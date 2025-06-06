import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    subscriptionStatus: string;
    trialEndDate: Date | null;
    subscriptionEndDate: Date | null;
  };
}

// Generate JWT token
export function generateToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Get fresh user data from database
    const user = await storage.getUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ message: "User not found or inactive" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || "user",
      subscriptionStatus: user.subscriptionStatus || "trial",
      trialEndDate: user.trialEndDate,
      subscriptionEndDate: user.subscriptionEndDate,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Check if user is admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

// Check subscription status and trial period
export function checkSubscriptionAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Admin always has access
  if (req.user.role === "admin") {
    return next();
  }

  const now = new Date();
  const { subscriptionStatus, trialEndDate, subscriptionEndDate } = req.user;

  // Check if trial is still valid
  if (subscriptionStatus === "trial" && trialEndDate && now <= trialEndDate) {
    return next();
  }

  // Check if subscription is active
  if (subscriptionStatus === "active" && subscriptionEndDate && now <= subscriptionEndDate) {
    return next();
  }

  // Trial expired or subscription inactive
  return res.status(402).json({ 
    message: "Subscription required", 
    subscriptionStatus,
    trialExpired: subscriptionStatus === "trial" && trialEndDate && now > trialEndDate
  });
}

// Check if basic features are accessible (map, vessels, ports, refineries during trial)
export function checkBasicAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Admin always has access
  if (req.user.role === "admin") {
    return next();
  }

  const now = new Date();
  const { subscriptionStatus, trialEndDate, subscriptionEndDate } = req.user;

  // During trial, allow access to basic features
  if (subscriptionStatus === "trial" && trialEndDate && now <= trialEndDate) {
    return next();
  }

  // Check if subscription is active
  if (subscriptionStatus === "active" && subscriptionEndDate && now <= subscriptionEndDate) {
    return next();
  }

  // No access if trial expired and no active subscription
  return res.status(402).json({ 
    message: "Subscription required", 
    subscriptionStatus,
    trialExpired: subscriptionStatus === "trial" && trialEndDate && now > trialEndDate
  });
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Calculate trial end date (3 days from now)
export function calculateTrialEndDate(): Date {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 3);
  return trialEnd;
}