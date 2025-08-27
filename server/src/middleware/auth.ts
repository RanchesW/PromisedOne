import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { getJwtSecret } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware debug:', { 
    hasAuthHeader: !!authHeader, 
    hasToken: !!token,
    authHeader: authHeader?.substring(0, 20) + '...',
    url: req.url
  });

  if (!token) {
    console.log('Auth: No token provided');
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const jwtSecret = getJwtSecret();
    console.log('Auth: Using JWT secret length:', jwtSecret.length, 'First 10 chars:', jwtSecret.substring(0, 10));
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('Auth: Token decoded successfully:', { userId: decoded.userId });
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('Auth: User not found');
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    console.log('Auth: User found:', {
      userId: user._id,
      username: user.username,
      email: user.email
    });

    req.user = user;
    next();
  } catch (error) {
    console.log('Auth: Token verification failed:', error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

export const authenticateToken = auth; // Keep backward compatibility

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};
