import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { CreateInternshipInput, InternshipFilterQuery } from '../../shared';

export class InternshipService {
  async createInternship(userId: string, data: CreateInternshipInput) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');
    }

    // Unverified companies cannot publish internships immediately
    let finalStatus = data.status;
    if (data.status === 'PUBLISHED' && company.verificationStatus !== 'VERIFIED') {
      finalStatus = 'DRAFT';
    }

    return await prisma.$transaction(async (tx) => {
      const internship = await tx.internship.create({
        data: {
          companyProfileId: company.id,
          title: data.title,
          category: data.category,
          description: data.description,
          responsibilities: data.responsibilities,
          eligibilityDegrees: data.eligibilityDegrees,
          eligibilityBranches: data.eligibilityBranches,
          eligibilityGraduationYears: data.eligibilityGraduationYears,
          minCgpa: data.minCgpa,
          workMode: data.workMode as any,
          locationCity: data.locationCity,
          locationState: data.locationState,
          durationMonths: data.durationMonths,
          stipendAmount: data.isUnpaid ? null : data.stipendAmount,
          isUnpaid: data.isUnpaid,
          openingsCount: data.openingsCount,
          deadline: new Date(data.deadline),
          status: finalStatus as any,
        },
      });

      if (data.requiredSkills && data.requiredSkills.length > 0) {
        await tx.internshipSkill.createMany({
          data: data.requiredSkills.map((s) => ({
            internshipId: internship.id,
            skillId: s.skillId,
            minLevel: s.minLevel as any,
            isRequired: s.isRequired,
          })),
        });
      }

      return await tx.internship.findUnique({
        where: { id: internship.id },
        include: {
          requiredSkills: {
            include: { skill: true },
          },
          company: true,
        },
      });
    });
  }

  async updateInternship(userId: string, internshipId: string, data: Partial<CreateInternshipInput>) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
    });

    if (!internship || internship.companyProfileId !== company.id) {
      throw new AppError(404, 'INTERNSHIP_NOT_FOUND', 'Internship not found or unauthorized');
    }

    let finalStatus = data.status;
    if (data.status === 'PUBLISHED' && company.verificationStatus !== 'VERIFIED') {
      finalStatus = 'DRAFT';
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.internship.update({
        where: { id: internshipId },
        data: {
          title: data.title,
          category: data.category,
          description: data.description,
          responsibilities: data.responsibilities,
          eligibilityDegrees: data.eligibilityDegrees,
          eligibilityBranches: data.eligibilityBranches,
          eligibilityGraduationYears: data.eligibilityGraduationYears,
          minCgpa: data.minCgpa,
          workMode: data.workMode as any,
          locationCity: data.locationCity,
          locationState: data.locationState,
          durationMonths: data.durationMonths,
          stipendAmount: data.isUnpaid ? null : data.stipendAmount,
          isUnpaid: data.isUnpaid,
          openingsCount: data.openingsCount,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
          status: finalStatus as any,
        },
      });

      if (data.requiredSkills) {
        await tx.internshipSkill.deleteMany({ where: { internshipId } });
        if (data.requiredSkills.length > 0) {
          await tx.internshipSkill.createMany({
            data: data.requiredSkills.map((s) => ({
              internshipId,
              skillId: s.skillId,
              minLevel: s.minLevel as any,
              isRequired: s.isRequired,
            })),
          });
        }
      }

      return await tx.internship.findUnique({
        where: { id: internshipId },
        include: {
          requiredSkills: { include: { skill: true } },
          company: true,
        },
      });
    });
  }

  async listInternships(query: InternshipFilterQuery) {
    const where: Prisma.InternshipWhereInput = {
      status: 'PUBLISHED',
      deadline: { gte: new Date() },
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
        { company: { brandName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.workMode) {
      where.workMode = query.workMode as any;
    }

    if (query.city) {
      where.locationCity = { contains: query.city, mode: 'insensitive' };
    }

    if (query.state) {
      where.locationState = { contains: query.state, mode: 'insensitive' };
    }

    if (query.isUnpaid !== undefined) {
      where.isUnpaid = query.isUnpaid;
    }

    if (query.minStipend && !query.isUnpaid) {
      where.stipendAmount = { gte: query.minStipend };
    }

    if (query.verifiedOnly) {
      where.company = { verificationStatus: 'VERIFIED' };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.internship.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
        },
        include: {
          company: {
            select: {
              id: true,
              brandName: true,
              logoUrl: true,
              city: true,
              state: true,
              verificationStatus: true,
            },
          },
          requiredSkills: {
            include: { skill: true },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.internship.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInternshipById(id: string) {
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            legalName: true,
            brandName: true,
            websiteUrl: true,
            logoUrl: true,
            city: true,
            state: true,
            verificationStatus: true,
            description: true,
            verificationRequests: {
              where: { status: 'VERIFIED' },
              take: 1,
              include: {
                checks: {
                  select: {
                    checkType: true,
                    status: true,
                    providerName: true,
                    executedAt: true,
                  },
                },
              },
            },
          },
        },
        requiredSkills: {
          include: { skill: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!internship) {
      throw new AppError(404, 'NOT_FOUND', 'Internship not found');
    }

    return internship;
  }

  async getCompanyInternships(userId: string) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');

    const internships = await prisma.internship.findMany({
      where: { companyProfileId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        requiredSkills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    return internships;
  }
}

export const internshipService = new InternshipService();
