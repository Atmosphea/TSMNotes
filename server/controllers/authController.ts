import { Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../auth';
import { userService } from '../services/userService';

export class AuthController {
  private generateToken(userId: number): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'notetrade-secret-key',
      { expiresIn: '30d' }
    );
  }

  async signup(req: AuthRequest, res: Response) {
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
      const existingUser = await userService.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }

      const existingEmail = await userService.getUserByEmail(userData.email);
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
      const newUser = await userService.createUser({
        ...userData,
        password: hashedPassword,
        role: 'user'
      });

      // Generate JWT token
      const token = this.generateToken(newUser.id);

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { username, password } = req.body;

      const user = await userService.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const user = await userService.getUser(req.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

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
  }
}

// Valid invite keys (in a real app, these would be stored in the database)
const VALID_INVITE_KEYS = ['TEST123'];
