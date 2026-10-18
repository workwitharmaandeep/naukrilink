import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { CompanyProfileInput } from '../../shared';

export class CompanyService {
  async getMyProfile(userId: string) {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId },
      include: {
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            checks: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Company profile not found');
    }

    return profile;
  }

  async updateMyProfile(userId: string, data: CompanyProfileInput) {
    const profile = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'Company profile not found');

    const updated = await prisma.companyProfile.update({
      where: { id: profile.id },
      data: {
        legalName: data.legalName,
        brandName: data.brandName,
        industry: data.industry,
        companySize: data.companySize,
        websiteUrl: data.websiteUrl,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        gstin: data.gstin,
        cin: data.cin,
        contactPersonName: data.contactPersonName,
        contactPersonPhone: data.contactPersonPhone,
        contactPersonDesignation: data.contactPersonDesignation,
        description: data.description,
      },
    });

    return updated;
  }

  async getPublicProfile(companyId: string) {
    const profile = await prisma.companyProfile.findUnique({
      where: { id: companyId },
      include: {
        internships: {
          where: { status: 'PUBLISHED' },
          include: {
            requiredSkills: {
              include: { skill: true },
            },
          },
        },
        verificationRequests: {
          where: { status: 'VERIFIED' },
          orderBy: { reviewedAt: 'desc' },
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
    });

    if (!profile) {
      throw new AppError(404, 'NOT_FOUND', 'Company not found');
    }

    return profile;
  }
}

export const companyService = new CompanyService();
