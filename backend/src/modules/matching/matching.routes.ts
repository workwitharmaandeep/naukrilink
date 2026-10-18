import { Router } from 'express';
import { matchingController } from './matching.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Student matching endpoints
router.get('/recommendations', authorize('STUDENT'), (req, res, next) =>
  matchingController.getRecommendations(req, res, next)
);

router.get('/internship/:id', authorize('STUDENT'), (req, res, next) =>
  matchingController.getMatchForInternship(req, res, next)
);

export default router;
