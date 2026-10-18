import { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service';

export class ApplicationController {
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await applicationService.apply(req.user!.userId, req.body);
      return res.status(201).json({
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      return next(error);
    }
  }

  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const application = await applicationService.withdraw(req.user!.userId, id);
      return res.status(200).json({
        message: 'Application withdrawn successfully',
        data: application,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await applicationService.getMyApplications(req.user!.userId);
      return res.status(200).json({ data: applications });
    } catch (error) {
      return next(error);
    }
  }

  async getInternshipApplicants(req: Request, res: Response, next: NextFunction) {
    try {
      const { internshipId } = req.params;
      const applicants = await applicationService.getInternshipApplicants(req.user!.userId, internshipId);
      return res.status(200).json({ data: applicants });
    } catch (error) {
      return next(error);
    }
  }

  async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await applicationService.updateApplicationStatus(req.user!.userId, id, req.body);
      return res.status(200).json({
        message: 'Applicant status updated successfully',
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const applicationController = new ApplicationController();
