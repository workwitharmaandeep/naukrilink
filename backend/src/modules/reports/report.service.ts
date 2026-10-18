import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';

export class ReportService {
  async createReport(
    userId: string,
    input: {
      targetType: 'COMPANY' | 'INTERNSHIP';
      targetId: string;
      reason: string;
      details?: string;
    }
  ) {
    if (input.targetType === 'COMPANY') {
      const company = await prisma.companyProfile.findUnique({ where: { id: input.targetId } });
      if (!company) throw new AppError(404, 'NOT_FOUND', 'Target company not found');
    } else if (input.targetType === 'INTERNSHIP') {
      const internship = await prisma.internship.findUnique({ where: { id: input.targetId } });
      if (!internship) throw new AppError(404, 'NOT_FOUND', 'Target internship not found');
    }

    const report = await prisma.report.create({
      data: {
        reportedById: userId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        details: input.details,
        status: 'PENDING',
      },
    });

    return report;
  }

  async getAdminReports(statusFilter?: string) {
    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reportedBy: {
          select: { email: true, role: true },
        },
      },
    });

    return reports;
  }

  async resolveReport(
    adminUserId: string,
    reportId: string,
    decision: {
      status: 'RESOLVED' | 'DISMISSED';
      resolutionNotes: string;
      shouldSuspend?: boolean;
    }
  ) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Report not found');

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id: reportId },
        data: {
          status: decision.status,
          resolvedById: adminUserId,
          resolutionNotes: decision.resolutionNotes,
        },
      });

      if (decision.shouldSuspend && decision.status === 'RESOLVED') {
        if (report.targetType === 'COMPANY') {
          await tx.companyProfile.update({
            where: { id: report.targetId },
            data: { verificationStatus: 'SUSPENDED' },
          });
          await tx.internship.updateMany({
            where: { companyProfileId: report.targetId },
            data: { status: 'PAUSED' },
          });
        } else if (report.targetType === 'INTERNSHIP') {
          await tx.internship.update({
            where: { id: report.targetId },
            data: { status: 'PAUSED' },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: `MODERATION_REPORT_${decision.status}`,
          targetResource: 'reports',
          targetId: reportId,
          details: {
            targetType: report.targetType,
            targetId: report.targetId,
            shouldSuspend: decision.shouldSuspend,
            notes: decision.resolutionNotes,
          },
        },
      });

      return updated;
    });
  }
}

export const reportService = new ReportService();
