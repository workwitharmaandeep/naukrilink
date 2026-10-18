import { Request, Response, NextFunction } from 'express';
import { quizService } from './quiz.service';

export class QuizController {
  async getAvailableQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await quizService.getAvailableQuizzes(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async startQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { skillId } = req.params;
      const data = await quizService.startQuizAttempt(req.user!.userId, skillId);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { attemptId } = req.params;
      const data = await quizService.submitQuizAttempt(req.user!.userId, attemptId, req.body);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await quizService.getStudentQuizHistory(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }
}

export const quizController = new QuizController();
