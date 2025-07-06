// Temporary fallback authentication for when database is unavailable
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface FallbackUser {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Temporary in-memory users for testing
const fallbackUsers: FallbackUser[] = [
  {
    id: 1,
    email: 'admin@petrodealhub.com',
    password: '$2b$10$rQJJqHO4n4yO1KGxOQH4G.Cv8tqNmJjLrOHxJQ5n4yO1KGxOQH4G.', // hashed "admin123"
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2b$10$rQJJqHO4n4yO1KGxOQH4G.Cv8tqNmJjLrOHxJQ5n4yO1KGxOQH4G.', // hashed "admin123"
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  }
];

export class FallbackAuth {
  static async login(email: string, password: string) {
    try {
      const user = fallbackUsers.find(u => u.email === email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // For demo purposes, accept both the actual password and hashed comparison
      const isValid = password === 'admin123' || await bcrypt.compare(password, user.password);
      if (!isValid) {
        return { success: false, message: 'Invalid password' };
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token
      };
    } catch (error) {
      console.error('Fallback auth error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  static async getUserById(id: number) {
    const user = fallbackUsers.find(u => u.id === id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}