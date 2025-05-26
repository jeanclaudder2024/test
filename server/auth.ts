import bcrypt from 'bcrypt';
import session from 'express-session';
import type { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';

// User interface
interface AuthUser {
  id: number;
  username: string;
  email: string;
  password?: string;
  phone?: string | null;
  provider?: string | null;
  providerId?: string | null;
  photoURL?: string | null;
  displayName?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  isSubscribed?: boolean | null;
  subscriptionTier?: string | null;
  createdAt?: Date | null;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface User extends AuthUser {}
    interface Request {
      user?: AuthUser;
    }
  }
}

// Password utilities
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
}

// Session configuration
function getSessionConfig() {
  return session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

// Setup authentication routes and middleware
export function setupAuth(app: Express) {
  // Session middleware
  app.use(getSessionConfig());

  // Create admin user if it doesn't exist
  createAdminUser();

  // Login route
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Get user from database
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      if (!user.password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set session
      req.session.userId = user.id;
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Get current user route
  app.get('/api/user', requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUserById(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Register route (for future use)
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const existingEmail = await storage.getUserByUsername(email);
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = newUser.id;

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// Create admin user on startup
async function createAdminUser() {
  try {
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin123');
      await storage.createUser({
        username: 'admin',
        email: 'admin@oilbroker.com',
        password: hashedPassword,
      });
      console.log('✅ Admin user created: admin/admin123');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}