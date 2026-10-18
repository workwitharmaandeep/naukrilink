import { Router } from 'express';
import { interviewController } from './interview.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Student mock interview routes
router.post('/start', authorize('STUDENT'), (req, res, next) =>
  interviewController.startInterview(req, res, next)
);

router.post('/:id/message', authorize('STUDENT'), (req, res, next) =>
  interviewController.postMessage(req, res, next)
);

router.post('/:id/evaluate', authorize('STUDENT'), (req, res, next) =>
  interviewController.evaluate(req, res, next)
);

router.get('/my-interviews', authorize('STUDENT'), (req, res, next) =>
  interviewController.getMyInterviews(req, res, next)
);

router.get('/:id', authorize('STUDENT'), (req, res, next) =>
  interviewController.getDetails(req, res, next)
);

export default router;
