import { Router } from 'express';
import { internshipController } from './internship.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createInternshipSchema, internshipFilterSchema } from '../../shared';

const router = Router();

// Public endpoints
router.get('/', validate({ query: internshipFilterSchema }), (req, res, next) =>
  internshipController.listInternships(req, res, next)
);

router.get('/:id', (req, res, next) => internshipController.getInternshipById(req, res, next));

// Company-only endpoints
router.post(
  '/',
  authenticate,
  authorize('COMPANY'),
  validate({ body: createInternshipSchema }),
  (req, res, next) => internshipController.createInternship(req, res, next)
);

router.put(
  '/:id',
  authenticate,
  authorize('COMPANY'),
  (req, res, next) => internshipController.updateInternship(req, res, next)
);

router.get(
  '/company/my-listings',
  authenticate,
  authorize('COMPANY'),
  (req, res, next) => internshipController.getCompanyInternships(req, res, next)
);

export default router;
