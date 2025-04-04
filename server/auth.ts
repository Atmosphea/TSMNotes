import { Request, Response, Express, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthController } from './controllers/authController';

// Define custom type for authenticated requests
export interface AuthRequest extends Request {
  userId?: number;
  isAuthenticated?: boolean;
}

// Set up auth middleware and routes
export function setupAuth(app: Express) {
  const authController = new AuthController();
  
  // Auth routes
  app.post('/api/auth/register', authController.signup.bind(authController));
  app.post('/api/auth/login', authController.login.bind(authController));
  app.post('/api/auth/logout', (req, res) => res.status(200).json({ success: true }));
  app.get('/api/auth/current-user', authenticateToken, authController.getCurrentUser.bind(authController));

  // Authentication middleware for routes that need to be protected
  app.use(authenticateToken);
}

// JWT authentication middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    req.isAuthenticated = false;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, decoded: any) => {
    if (err) {
      req.isAuthenticated = false;
      return next();
    }

    req.userId = decoded.userId;
    req.isAuthenticated = true;
    next();
  });
}