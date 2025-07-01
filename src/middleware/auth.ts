import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export const authenticate = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      res.status(401).json({ error: 'Access denied. Invalid token format.' });
      return;
    }

    // Validate token and get user
    const user = await authService.validateToken(token);
    req.user = user;
    
    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid token' });
  }
};

/**
 * Middleware to authorize specific user roles
 */
export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. User not authenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Forbidden. Required roles: ${roles.join(', ')}. User role: ${req.user.role}` 
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if the authenticated user is the owner of a resource
 * Uses req.params.id to compare with req.user.id
 */
export const authorizeOwner = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized. User not authenticated.' });
    return;
  }

  const resourceUserId = req.params.userId || req.params.id;
  
  if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
    res.status(403).json({ 
      error: 'Forbidden. You can only access your own resources.' 
    });
    return;
  }

  next();
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export const optionalAuth = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      if (token) {
        try {
          const user = await authService.validateToken(token);
          req.user = user;
        } catch (error) {
          // Ignore token validation errors for optional auth
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};