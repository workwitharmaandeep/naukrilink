import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { ApplyInternshipInput, UpdateApplicationStatusInput } from '../../shared';

export class ApplicationService {
  async apply(userId: string, input: ApplyInternshipInput) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { skills: true },
    });

    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Complete your student profile before applying');
    }

    const internship = await prisma.internship.findUnique({
      where: { id: input.internshipId },
      include: { requiredSkills: true },
    });

    if (!internship) {
      throw new AppError(404, 'INTERNSHIP_NOT_FOUND', 'Internship does not exist');
    }

    if (internship.status !== 'PUBLISHED') {
      throw new AppError(400, 'INTERNSHIP_INACTIVE', 'This internship is not currently accepting applications');
    }

    if (new Date() > internship.deadline) {
      throw new AppError(400, 'DEADLINE_PASSED', 'The application deadline for this internship has passed');
    }

    const existing = await prisma.application.findUnique({
      where: {
        internshipId_studentProfileId: {
          internshipId: internship.id,
          studentProfileId: student.id,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'ALREADY_APPLIED', 'You have already applied for this internship');
    }

    // Check if match score exists
    const matchScore = await prisma.matchScore.findUnique({
      where: {
        studentProfileId_internshipId: {
          studentProfileId: student.id,
          internshipId: internship.id,
        },
      },
    });

    return await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          internshipId: internship.id,
          studentProfileId: student.id,
          coverNote: input.coverNote,
          matchScoreSnapshot: matchScore ? matchScore.matchPercentage : null,
          currentStatus: 'APPLIED',
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: null,
          toStatus: 'APPLIED',
          changedById: userId,
          notes: 'Application submitted by candidate',
        },
      });

      return application;
    });
  }

  async withdraw(userId: string, applicationId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found');

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.studentProfileId !== student.id) {
      throw new AppError(404, 'APPLICATION_NOT_FOUND', 'Application not found');
    }

    if (application.currentStatus === 'WITHDRAWN') {
      throw new AppError(400, 'ALREADY_WITHDRAWN', 'Application is already withdrawn');
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { currentStatus: 'WITHDRAWN' },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.currentStatus,
          toStatus: 'WITHDRAWN',
          changedById: userId,
          notes: 'Withdrawn by student',
        },
      });

      return updated;
    });
  }

  async getMyApplications(userId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found');

    const applications = await prisma.application.findMany({
      where: { studentProfileId: student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        internship: {
          include: {
            company: {
              select: {
                id: true,
                brandName: true,
                logoUrl: true,
                verificationStatus: true,
              },
            },
            requiredSkills: {
              include: { skill: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return applications;
  }

  async getInternshipApplicants(userId: string, internshipId: string) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');

    const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship || internship.companyProfileId !== company.id) {
      throw new AppError(404, 'INTERNSHIP_NOT_FOUND', 'Internship not found or unauthorized');
    }

    const applicants = await prisma.application.findMany({
      where: { internshipId },
      orderBy: { createdAt: 'desc' },
      include: {
        studentProfile: {
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return applicants;
  }

  async updateApplicationStatus(
    userId: string,
    applicationId: string,
    input: UpdateApplicationStatusInput
  ) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        internship: true,
        studentProfile: { select: { userId: true } },
      },
    });

    if (!application || application.internship.companyProfileId !== company.id) {
      throw new AppError(404, 'APPLICATION_NOT_FOUND', 'Application not found or unauthorized');
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { currentStatus: input.status as any },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: application.currentStatus,
          toStatus: input.status as any,
          changedById: userId,
          notes: input.notes || `Status updated to ${input.status}`,
        },
      });

      // Dispatch real-time in-app notification to the candidate
      await tx.notification.create({
        data: {
          userId: application.studentProfile.userId,
          title: `Application ${input.status}: ${application.internship.title}`,
          message: `${company.brandName} updated your application status to ${input.status}.${
            input.notes ? ` Note: "${input.notes}"` : ''
          }`,
          type: 'APPLICATION_UPDATE',
          linkUrl: '/student/applications',
        },
      });

      return updated;
    });
  }
}

export const applicationService = new ApplicationService();
