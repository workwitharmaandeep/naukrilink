import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { env } from '../../config/env.config';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.cookie('refreshToken', result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        message: 'Account registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      res.cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!rawToken) {
        return res.status(401).json({
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'Refresh token not provided',
            details: null,
          },
        });
      }

      const result = await authService.refreshToken(rawToken);

      res.cookie('accessToken', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: 'Tokens refreshed successfully',
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.cookies?.refreshToken;
      await authService.logout(rawToken);

      res.clearCookie('accessToken', COOKIE_OPTIONS);
      res.clearCookie('refreshToken', COOKIE_OPTIONS);

      return res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      return next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      return res.status(200).json({
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getAdminUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search } = req.query;
      const users = await authService.getAdminUsers(role as string, search as string);
      return res.status(200).json({ data: users });
    } catch (error) {
      return next(error);
    }
  }

  async updateAdminUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await authService.updateAdminUserStatus(id, status);
      return res.status(200).json({
        message: `User status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
