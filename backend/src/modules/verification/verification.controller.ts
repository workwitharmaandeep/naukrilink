import { Request, Response, NextFunction } from 'express';
import { verificationService } from './verification.service';

export class VerificationController {
  async submitVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.submitVerificationRequest(req.user!.userId, req.body);
      return res.status(200).json({
        message: 'Verification request and automated checks submitted successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getMyVerificationHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await verificationService.getCompanyVerificationHistory(req.user!.userId);
      return res.status(200).json({ data: history });
    } catch (error) {
      return next(error);
    }
  }

  async getAdminQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const queue = await verificationService.getAdminQueue(status ? String(status) : undefined);
      return res.status(200).json({ data: queue });
    } catch (error) {
      return next(error);
    }
  }

  async reviewRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      const updated = await verificationService.reviewRequest(req.user!.userId, id, {
        status,
        adminNotes,
      });
      return res.status(200).json({
        message: `Company verification request marked as ${status}`,
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const verificationController = new VerificationController();
