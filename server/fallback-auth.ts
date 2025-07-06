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

// Temporary in-memory users for testing with proper bcrypt hashes
const fallbackUsers: FallbackUser[] = [
  {
    id: 1,
    email: 'admin@petrodealhub.com',
    password: '$2b$10$UAaPVOd4jasr6MK1FVIImOv2aXpPAxnf8wbHta1ZQS2KGxHp0c.jy', // hashed "admin123"
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2b$10$WPWtYa1zvg6IiA5Ug9/jGOX0cQrR3UjYCrz9b2qtrmA64T88TQmKm', // hashed "admin123"
    firstName: 'Test',
    lastName: 'User',
    role: 'user'
  },
  {
    id: 3,
    email: 'test@test.com',
    password: '$2b$10$P.Vj7g3OA0Lk7WiQni99puwLkfIxuWXW6K42k9t.CTin3erfncQPe', // hashed "test123"
    firstName: 'New',
    lastName: 'Tester',
    role: 'user'
  },
  {
    id: 4,
    email: 'demo@demo.com',
    password: '$2b$10$ZLhhwDSHNM/aH2lFkcKg6.c/k7lBlzbfcHaaD77e4Vk/qh0L4AIQe', // hashed "demo123"
    firstName: 'Demo',
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

      // Handle both plain text and hashed passwords
      let isValid = false;
      
      // First try plain text comparison (for test accounts)
      if (password === user.password) {
        isValid = true;
      } else {
        // Then try bcrypt comparison (for hashed passwords)
        try {
          isValid = await bcrypt.compare(password, user.password);
        } catch (error) {
          // If bcrypt fails, password is likely plain text, so already checked above
          isValid = false;
        }
      }

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