import { Router } from 'express';
import { verificationController } from './verification.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Company routes: submit & check status
router.post('/submit', authorize('COMPANY'), (req, res, next) =>
  verificationController.submitVerification(req, res, next)
);

router.get('/my-history', authorize('COMPANY'), (req, res, next) =>
  verificationController.getMyVerificationHistory(req, res, next)
);

// Admin review queue & decision routes
router.get('/admin/queue', authorize('ADMIN', 'SUPER_ADMIN'), (req, res, next) =>
  verificationController.getAdminQueue(req, res, next)
);

router.patch('/admin/review/:id', authorize('ADMIN', 'SUPER_ADMIN'), (req, res, next) =>
  verificationController.reviewRequest(req, res, next)
);

export default router;
