import { Router } from 'express';
import { mentorshipController } from './mentorship.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Publicly browse mentorship sessions
router.get('/', (req, res, next) =>
  mentorshipController.getAvailableSessions(req, res, next)
);

router.get('/sessions', (req, res, next) =>
  mentorshipController.getAvailableSessions(req, res, next)
);

router.get('/:id', (req, res, next) =>
  mentorshipController.getSessionDetails(req, res, next)
);

// Authenticated actions
router.use(authenticate);

// Student actions
router.post('/slots/:slotId/book', authorize('STUDENT'), (req, res, next) =>
  mentorshipController.bookSlot(req, res, next)
);

router.delete('/enrolments/:enrolmentId', authorize('STUDENT'), (req, res, next) =>
  mentorshipController.cancelBooking(req, res, next)
);

router.get('/my/enrolments', authorize('STUDENT'), (req, res, next) =>
  mentorshipController.getMyEnrolments(req, res, next)
);

// Company actions
router.post('/sessions', authorize('COMPANY'), (req, res, next) =>
  mentorshipController.createSession(req, res, next)
);

router.get('/company/my-sessions', authorize('COMPANY'), (req, res, next) =>
  mentorshipController.getCompanySessions(req, res, next)
);

export default router;
