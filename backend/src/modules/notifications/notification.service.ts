import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
    linkUrl?: string
  ) {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        linkUrl,
        isRead: false,
      },
    });
  }

  async getMyNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new AppError(404, 'NOT_FOUND', 'Notification not found');
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
