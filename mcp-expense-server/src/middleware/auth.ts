import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const authHeader = req.headers['authorization'] as string;
    
    // Check API key
    if (apiKey && apiKey === config.auth.apiKey) {
      return next();
    }
    
    // Check Bearer token (for future JWT implementation)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Here you would validate the JWT token
      // For now, we'll just check if it exists
      if (token) {
        return next();
      }
    }
    
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid API key or authorization token required'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid authentication credentials'
    });
  }
};