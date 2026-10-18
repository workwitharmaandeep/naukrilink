import { Router } from 'express';
import { companyController } from './company.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { companyProfileSchema } from '../../shared';

const router = Router();

// Public route to view company profile
router.get('/public/:id', (req, res, next) => companyController.getPublicProfile(req, res, next));

// Company-only authenticated routes
router.get('/profile', authenticate, authorize('COMPANY'), (req, res, next) =>
  companyController.getMyProfile(req, res, next)
);

router.put(
  '/profile',
  authenticate,
  authorize('COMPANY'),
  validate({ body: companyProfileSchema }),
  (req, res, next) => companyController.updateMyProfile(req, res, next)
);

export default router;
