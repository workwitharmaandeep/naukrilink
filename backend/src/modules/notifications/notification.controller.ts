import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';

export class NotificationController {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await notificationService.getMyNotifications(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await notificationService.markAsRead(req.user!.userId, id);
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      return next(error);
    }
  }
}

export const notificationController = new NotificationController();
