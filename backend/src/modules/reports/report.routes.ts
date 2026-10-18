import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Any authenticated user can submit a report
router.post('/', (req, res, next) => reportController.createReport(req, res, next));

// Admin moderation queue
router.get('/admin', authorize('ADMIN', 'SUPER_ADMIN'), (req, res, next) =>
  reportController.getAdminReports(req, res, next)
);

router.patch('/admin/:id', authorize('ADMIN', 'SUPER_ADMIN'), (req, res, next) =>
  reportController.resolveReport(req, res, next)
);

export default router;
