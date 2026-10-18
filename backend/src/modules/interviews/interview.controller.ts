import { Request, Response, NextFunction } from 'express';
import { interviewService } from './interview.service';

export class InterviewController {
  async startInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await interviewService.startInterview(req.user!.userId, req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async postMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await interviewService.handleStudentMessage(req.user!.userId, id, req.body);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async evaluate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await interviewService.evaluateInterview(req.user!.userId, id);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await interviewService.getInterviewDetails(req.user!.userId, id);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async getMyInterviews(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await interviewService.getMyInterviews(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }
}

export const interviewController = new InterviewController();
