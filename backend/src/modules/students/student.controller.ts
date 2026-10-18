import { Request, Response, NextFunction } from 'express';
import { studentService } from './student.service';

export class StudentController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await studentService.getProfile(req.user!.userId);
      return res.status(200).json({ data: profile });
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await studentService.updateProfile(req.user!.userId, req.body);
      return res.status(200).json({
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  }

  async addSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const { skillId, declaredLevel } = req.body;
      const skill = await studentService.addSkill(req.user!.userId, skillId, declaredLevel);
      return res.status(201).json({
        message: 'Skill added to profile',
        data: skill,
      });
    } catch (error) {
      return next(error);
    }
  }

  async removeSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await studentService.removeSkill(req.user!.userId, id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const studentController = new StudentController();
