import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { authLimiter } from '../../middleware/rate-limit.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../shared';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authLimiter, validate({ body: loginSchema }), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

router.post('/logout', (req, res, next) => authController.logout(req, res, next));

router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

router.post(
  '/forgot-password',
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  (req, res, next) => authController.forgotPassword(req, res, next)
);

router.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPasswordSchema }),
  (req, res, next) => authController.resetPassword(req, res, next)
);

// Admin User Directory & Moderation
router.get(
  '/admin/users',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  (req, res, next) => authController.getAdminUsers(req, res, next)
);

router.patch(
  '/admin/users/:id/status',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  (req, res, next) => authController.updateAdminUserStatus(req, res, next)
);

export default router;
