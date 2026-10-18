import { Router } from 'express';
import { quizController } from './quiz.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Student skill quiz assessment routes
router.get('/available', authorize('STUDENT'), (req, res, next) =>
  quizController.getAvailableQuizzes(req, res, next)
);

router.post('/start/:skillId', authorize('STUDENT'), (req, res, next) =>
  quizController.startQuiz(req, res, next)
);

router.post('/submit/:attemptId', authorize('STUDENT'), (req, res, next) =>
  quizController.submitQuiz(req, res, next)
);

router.get('/history', authorize('STUDENT'), (req, res, next) =>
  quizController.getHistory(req, res, next)
);

export default router;
