import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
    iat: number;
    exp: number;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError(401, 'No token provided. Please login.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError(401, 'Token expired. Please login again.');
    }
    throw new AppError(401, 'Invalid token.');
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required.');
  }

  if (req.user.role !== 'admin') {
    throw new AppError(403, 'Admin access required.');
  }

  next();
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest['user'];
      req.user = decoded;
    } catch (error) {
      // Token invalid but optional, continue without user
    }
  }

  next();
};
