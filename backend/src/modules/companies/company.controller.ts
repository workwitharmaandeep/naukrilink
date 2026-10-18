import { Request, Response, NextFunction } from 'express';
import { companyService } from './company.service';

export class CompanyController {
  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await companyService.getMyProfile(req.user!.userId);
      return res.status(200).json({ data: profile });
    } catch (error) {
      return next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await companyService.updateMyProfile(req.user!.userId, req.body);
      return res.status(200).json({
        message: 'Company profile updated successfully',
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await companyService.getPublicProfile(id);
      return res.status(200).json({ data: profile });
    } catch (error) {
      return next(error);
    }
  }
}

export const companyController = new CompanyController();
