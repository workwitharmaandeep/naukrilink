import { Request, Response, NextFunction } from 'express';
import { internshipService } from './internship.service';

export class InternshipController {
  async createInternship(req: Request, res: Response, next: NextFunction) {
    try {
      const internship = await internshipService.createInternship(req.user!.userId, req.body);
      return res.status(201).json({
        message: 'Internship created successfully',
        data: internship,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateInternship(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const internship = await internshipService.updateInternship(req.user!.userId, id, req.body);
      return res.status(200).json({
        message: 'Internship updated successfully',
        data: internship,
      });
    } catch (error) {
      return next(error);
    }
  }

  async listInternships(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await internshipService.listInternships(req.query as any);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getInternshipById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const internship = await internshipService.getInternshipById(id);
      return res.status(200).json({ data: internship });
    } catch (error) {
      return next(error);
    }
  }

  async getCompanyInternships(req: Request, res: Response, next: NextFunction) {
    try {
      const internships = await internshipService.getCompanyInternships(req.user!.userId);
      return res.status(200).json({ data: internships });
    } catch (error) {
      return next(error);
    }
  }
}

export const internshipController = new InternshipController();
