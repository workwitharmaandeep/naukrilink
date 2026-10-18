import { Request, Response, NextFunction } from 'express';
import { mentorshipService } from './mentorship.service';

export class MentorshipController {
  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mentorshipService.createSession(req.user!.userId, req.body);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async getAvailableSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { skill, topic } = req.query;
      const data = await mentorshipService.getAvailableSessions(
        skill ? String(skill) : undefined,
        topic ? String(topic) : undefined
      );
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async getSessionDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await mentorshipService.getSessionDetails(id);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async bookSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { slotId } = req.params;
      const data = await mentorshipService.bookSlot(req.user!.userId, slotId);
      return res.status(201).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrolmentId } = req.params;
      const data = await mentorshipService.cancelBooking(req.user!.userId, enrolmentId);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async getMyEnrolments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mentorshipService.getMyEnrolments(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async getCompanySessions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await mentorshipService.getCompanySessions(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }
}

export const mentorshipController = new MentorshipController();
