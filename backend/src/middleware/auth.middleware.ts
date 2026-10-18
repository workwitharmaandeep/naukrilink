import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { prisma } from '../db/prisma';
import { AppError } from './error.middleware';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: string;
  studentProfileId?: string;
  companyProfileId?: string;
  collegeProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication token missing or invalid'));
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError(401, 'TOKEN_EXPIRED', 'Access token has expired. Please refresh token.'));
      }
      return next(new AppError(401, 'INVALID_TOKEN', 'Token verification failed.'));
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: { select: { id: true } },
        companyProfile: { select: { id: true } },
        collegeProfile: { select: { id: true } },
      },
    });

    if (!user) {
      return next(new AppError(401, 'USER_NOT_FOUND', 'User belonging to this token no longer exists.'));
    }

    if (user.status === 'SUSPENDED') {
      return next(new AppError(403, 'USER_SUSPENDED', 'Account suspended. Contact administration.'));
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentProfileId: user.studentProfile?.id,
      companyProfileId: user.companyProfile?.id,
      collegeProfileId: user.collegeProfile?.id,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          'FORBIDDEN',
          `Access forbidden: required role ${allowedRoles.join(' or ')} but current role is ${req.user.role}`
        )
      );
    }

    return next();
  };
}
