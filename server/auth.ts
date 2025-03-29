import { Request, Response, Express, NextFunction } from 'express';
import { storage } from './storage';
import { insertUserSchema } from '@shared/schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import session from 'express-session';
import connectPg from 'connect-pg-simple';

// Extend session to include custom properties
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Valid invite keys (in a real app, these would be stored in the database)
const VALID_INVITE_KEYS = ['key', 'TEST123']; // Added test key

// Set up session middleware
export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  // Session middleware
  app.use(session({
    store: new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'notetrade-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }
  }));

  // Auth routes
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
      const { inviteKey, ...userData } = req.body;

      // Validate invite key
      if (!VALID_INVITE_KEYS.includes(inviteKey)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid invite key'
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Validate user data
      const validationResult = insertUserSchema.safeParse(userData);
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user data',
          errors: validationResult.error.errors
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: 'user'
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;

      // Set user in session
      req.session.userId = newUser.id;

      res.status(201).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Set user in session
      req.session.userId = user.id;

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Logout failed'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    });
  });

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

  // Authentication middleware for routes that need to be protected
  app.use((req: Request & { isAuthenticated?: boolean; userId?: number }, 
        res: Response, 
        next: NextFunction) => {
    if (req.session && req.session.userId) {
      req.isAuthenticated = true;
      req.userId = req.session.userId;
    } else {
      req.isAuthenticated = false;
    }
    next();
  });
}