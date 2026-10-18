import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { WorkMode, MentorshipStatus, EnrolmentStatus } from '@prisma/client';

export interface CreateMentorshipSessionInput {
  title: string;
  topic: string;
  description: string;
  targetSkills?: string[];
  targetRoles?: string[];
  mode?: WorkMode;
  meetingLink?: string;
  slots: Array<{
    startTime: string; // ISO date string
    endTime: string;   // ISO date string
    capacity: number;
  }>;
}

export class MentorshipService {
  async createSession(userId: string, input: CreateMentorshipSessionInput) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');
    }

    if (company.verificationStatus === 'SUSPENDED') {
      throw new AppError(403, 'COMPANY_SUSPENDED', 'Suspended employers cannot host mentorship sessions');
    }

    if (!input.slots || input.slots.length === 0) {
      throw new AppError(400, 'NO_SLOTS', 'At least one time slot is required to host a session');
    }

    return await prisma.$transaction(async (tx) => {
      const session = await tx.mentorshipSession.create({
        data: {
          companyProfileId: company.id,
          title: input.title,
          topic: input.topic,
          description: input.description,
          targetSkills: input.targetSkills || [],
          targetRoles: input.targetRoles || [],
          mode: input.mode || WorkMode.REMOTE,
          meetingLink: input.meetingLink || 'https://meet.google.com/nex-aura-session',
          status: MentorshipStatus.SCHEDULED,
        },
      });

      for (const slot of input.slots) {
        await tx.mentorshipSlot.create({
          data: {
            mentorshipSessionId: session.id,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            capacity: slot.capacity || 1,
            bookedCount: 0,
          },
        });
      }

      return await tx.mentorshipSession.findUnique({
        where: { id: session.id },
        include: { slots: true },
      });
    });
  }

  async getAvailableSessions(targetSkill?: string, topic?: string) {
    const where: any = {
      status: MentorshipStatus.SCHEDULED,
    };

    if (topic) {
      where.topic = { contains: topic, mode: 'insensitive' };
    }

    if (targetSkill) {
      where.targetSkills = { has: targetSkill };
    }

    const sessions = await prisma.mentorshipSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            brandName: true,
            legalName: true,
            verificationStatus: true,
            logoUrl: true,
          },
        },
        slots: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    return sessions;
  }

  async getSessionDetails(sessionId: string) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        company: {
          select: {
            id: true,
            brandName: true,
            legalName: true,
            description: true,
            websiteUrl: true,
            verificationStatus: true,
          },
        },
        slots: {
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!session) {
      throw new AppError(404, 'SESSION_NOT_FOUND', 'Mentorship session not found');
    }

    return session;
  }

  async bookSlot(userId: string, slotId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Complete student profile before booking mentorship sessions');
    }

    const slot = await prisma.mentorshipSlot.findUnique({
      where: { id: slotId },
      include: {
        session: {
          include: { company: true },
        },
      },
    });

    if (!slot) {
      throw new AppError(404, 'SLOT_NOT_FOUND', 'Mentorship slot not found');
    }

    if (new Date() > new Date(slot.startTime)) {
      throw new AppError(400, 'SLOT_EXPIRED', 'This time slot has already passed');
    }

    if (slot.bookedCount >= slot.capacity) {
      throw new AppError(400, 'SLOT_FULL', 'This mentorship slot is fully booked');
    }

    const existingEnrolment = await prisma.mentorshipEnrolment.findUnique({
      where: {
        mentorshipSlotId_studentProfileId: {
          mentorshipSlotId: slot.id,
          studentProfileId: student.id,
        },
      },
    });

    if (existingEnrolment && existingEnrolment.status === EnrolmentStatus.ENROLLED) {
      throw new AppError(409, 'ALREADY_ENROLLED', 'You are already enrolled in this mentorship slot');
    }

    return await prisma.$transaction(async (tx) => {
      // Increment booked count
      await tx.mentorshipSlot.update({
        where: { id: slot.id },
        data: { bookedCount: { increment: 1 } },
      });

      // Upsert enrolment
      const enrolment = await tx.mentorshipEnrolment.upsert({
        where: {
          mentorshipSlotId_studentProfileId: {
            mentorshipSlotId: slot.id,
            studentProfileId: student.id,
          },
        },
        update: {
          status: EnrolmentStatus.ENROLLED,
          cancelledAt: null,
        },
        create: {
          mentorshipSlotId: slot.id,
          studentProfileId: student.id,
          status: EnrolmentStatus.ENROLLED,
        },
      });

      // Send confirmation in-app notification
      await tx.notification.create({
        data: {
          userId,
          title: `Mentorship Booked: ${slot.session.title}`,
          message: `Your session with ${slot.session.company.brandName} is confirmed for ${new Date(
            slot.startTime
          ).toLocaleString()}. Meeting link: ${slot.session.meetingLink || 'Provided before session'}.`,
          type: 'MENTORSHIP_REMINDER',
          linkUrl: '/student/mentorship',
        },
      });

      return enrolment;
    });
  }

  async cancelBooking(userId: string, enrolmentId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found');

    const enrolment = await prisma.mentorshipEnrolment.findUnique({
      where: { id: enrolmentId },
      include: { slot: true },
    });

    if (!enrolment || enrolment.studentProfileId !== student.id) {
      throw new AppError(404, 'ENROLMENT_NOT_FOUND', 'Booking not found');
    }

    if (enrolment.status === EnrolmentStatus.CANCELLED) {
      throw new AppError(400, 'ALREADY_CANCELLED', 'Booking is already cancelled');
    }

    return await prisma.$transaction(async (tx) => {
      // Decrement booked count on slot
      await tx.mentorshipSlot.update({
        where: { id: enrolment.mentorshipSlotId },
        data: { bookedCount: { decrement: 1 } },
      });

      const updated = await tx.mentorshipEnrolment.update({
        where: { id: enrolmentId },
        data: {
          status: EnrolmentStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      return updated;
    });
  }

  async getMyEnrolments(userId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found');

    const enrolments = await prisma.mentorshipEnrolment.findMany({
      where: {
        studentProfileId: student.id,
        status: EnrolmentStatus.ENROLLED,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        slot: {
          include: {
            session: {
              include: {
                company: {
                  select: {
                    id: true,
                    brandName: true,
                    verificationStatus: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrolments;
  }

  async getCompanySessions(userId: string) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');

    const sessions = await prisma.mentorshipSession.findMany({
      where: { companyProfileId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        slots: {
          include: {
            enrolments: {
              include: {
                studentProfile: {
                  include: {
                    user: { select: { email: true } },
                    skills: { include: { skill: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return sessions;
  }
}

export const mentorshipService = new MentorshipService();
