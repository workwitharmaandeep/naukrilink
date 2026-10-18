import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';

export class ReportController {
  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportService.createReport(req.user!.userId, req.body);
      return res.status(201).json({
        message: 'Report submitted to moderation queue for review',
        data: report,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getAdminReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const reports = await reportService.getAdminReports(status ? String(status) : undefined);
      return res.status(200).json({ data: reports });
    } catch (error) {
      return next(error);
    }
  }

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await reportService.resolveReport(req.user!.userId, id, req.body);
      return res.status(200).json({
        message: 'Report moderation decision recorded',
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const reportController = new ReportController();
