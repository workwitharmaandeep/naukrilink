import { Router } from 'express';
import { applicationController } from './application.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { applyInternshipSchema, updateApplicationStatusSchema } from '../../shared';

const router = Router();

router.use(authenticate);

// Student application endpoints
router.post(
  '/apply',
  authorize('STUDENT'),
  validate({ body: applyInternshipSchema }),
  (req, res, next) => applicationController.apply(req, res, next)
);

router.post(
  '/:id/withdraw',
  authorize('STUDENT'),
  (req, res, next) => applicationController.withdraw(req, res, next)
);

router.get(
  '/my-applications',
  authorize('STUDENT'),
  (req, res, next) => applicationController.getMyApplications(req, res, next)
);

// Company application endpoints
router.get(
  '/internship/:internshipId',
  authorize('COMPANY'),
  (req, res, next) => applicationController.getInternshipApplicants(req, res, next)
);

router.patch(
  '/:id/status',
  authorize('COMPANY'),
  validate({ body: updateApplicationStatusSchema }),
  (req, res, next) => applicationController.updateApplicationStatus(req, res, next)
);

export default router;
