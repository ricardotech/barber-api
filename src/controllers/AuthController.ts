import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { RegisterDto, LoginDto } from '../types/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class AuthController {
  private authService = new AuthService();

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName, role }: RegisterDto = req.body;

      // Basic validation
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      // Password strength validation
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      // Role validation
      if (role && !['client', 'barber'].includes(role)) {
        res.status(400).json({ error: 'Role must be either "client" or "barber"' });
        return;
      }

      const result = await this.authService.register({
        email: email.toLowerCase().trim(),
        password,
        fullName: fullName?.trim(),
        role: role || 'client'
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message || 'Registration failed' });
    }
  };

  /**
   * Authenticate user login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginDto = req.body;

      // Basic validation
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.login({
        email: email.toLowerCase().trim(),
        password
      });

      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  };

  /**
   * Get current user profile
   */
  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await this.authService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Remove password from response
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { fullName } = req.body;
      
      // Only allow updating specific fields
      const updates: any = {};
      if (fullName !== undefined) {
        updates.fullName = fullName.trim();
      }

      const updatedUser = await this.authService.updateUser(req.user.id, updates);
      
      // Remove password from response
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
  };

  /**
   * Change user password
   */
  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters long' });
        return;
      }

      await this.authService.changePassword(req.user.id, currentPassword, newPassword);
      
      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(400).json({ error: error.message || 'Failed to change password' });
    }
  };

  /**
   * Validate current token (useful for token refresh checks)
   */
  validateToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      res.json({ 
        valid: true, 
        user: req.user 
      });
    } catch (error: any) {
      console.error('Token validation error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  /**
   * Logout user (client-side token removal, server doesn't store tokens)
   */
  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Since we're using stateless JWT, logout is handled client-side
      // This endpoint is mainly for logging and potential future token blacklisting
      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  };
}