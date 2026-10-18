import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { gstVerificationProvider } from '../../providers/verification/gst.provider';
import { mcaVerificationProvider } from '../../providers/verification/mca.provider';
import { domainVerificationProvider } from '../../providers/verification/domain.provider';
import { VerificationCheckResult } from '../../providers/verification/verification.interface';

export class VerificationService {
  async submitVerificationRequest(userId: string, input: { gstin?: string; cin?: string; websiteUrl: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { companyProfile: true },
    });

    if (!user || !user.companyProfile) {
      throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile does not exist');
    }

    const company = user.companyProfile;

    return await prisma.$transaction(async (tx) => {
      // 1. Create or record the Verification Request
      const request = await tx.verificationRequest.create({
        data: {
          companyProfileId: company.id,
          gstinSubmitted: input.gstin || company.gstin,
          cinSubmitted: input.cin || company.cin,
          websiteSubmitted: input.websiteUrl || company.websiteUrl,
          status: 'PENDING_REVIEW',
        },
      });

      // Update company profile submitted data
      await tx.companyProfile.update({
        where: { id: company.id },
        data: {
          gstin: input.gstin || company.gstin,
          cin: input.cin || company.cin,
          websiteUrl: input.websiteUrl || company.websiteUrl,
          verificationStatus: 'PENDING_REVIEW',
        },
      });

      // 2. Run Automated Statutory & Identity Checks
      const checkResults: VerificationCheckResult[] = [];

      // Check A: GSTIN Verification
      const targetGstin = input.gstin || company.gstin;
      if (targetGstin) {
        const gstResult = await gstVerificationProvider.verifyGstin(targetGstin, company.legalName);
        checkResults.push(gstResult);
      }

      // Check B: CIN Verification (if provided)
      const targetCin = input.cin || company.cin;
      if (targetCin) {
        const cinResult = await mcaVerificationProvider.verifyCin(targetCin, company.legalName);
        checkResults.push(cinResult);
      }

      // Check C: Domain & Identity Verification
      const targetWebsite = input.websiteUrl || company.websiteUrl;
      const domainResults = await domainVerificationProvider.verifyDomain(
        targetWebsite,
        user.email,
        company.brandName
      );

      checkResults.push(domainResults.domainResolves);
      checkResults.push(domainResults.httpsValid);
      checkResults.push(domainResults.emailDomainMatch);
      checkResults.push(domainResults.nameConsistency);

      // 3. Store every individual check in verification_checks for full auditability
      for (const chk of checkResults) {
        await tx.verificationCheck.create({
          data: {
            verificationRequestId: request.id,
            checkType: chk.checkType,
            status: chk.status as any,
            providerName: chk.providerName,
            details: chk.details,
            rawResponseSummary: chk.rawResponseSummary || {},
          },
        });
      }

      // 4. Compute Final Automated Verification Status
      const hasFatalFailure = checkResults.some(
        (c) => c.status === 'FAILED' && (c.checkType.includes('GSTIN') || c.checkType.includes('DNS'))
      );
      const hasManualReview = checkResults.some((c) => c.status === 'MANUAL_REVIEW' || c.status === 'WARNING');

      let computedStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'REJECTED' = 'PENDING_REVIEW';
      if (hasFatalFailure) {
        computedStatus = 'REJECTED';
      } else if (!hasManualReview && checkResults.every((c) => c.status === 'PASSED')) {
        computedStatus = 'VERIFIED';
      } else {
        computedStatus = 'PENDING_REVIEW';
      }

      // Update request and company profile with computed status
      const updatedRequest = await tx.verificationRequest.update({
        where: { id: request.id },
        data: {
          status: computedStatus,
        },
        include: {
          checks: true,
        },
      });

      await tx.companyProfile.update({
        where: { id: company.id },
        data: {
          verificationStatus: computedStatus,
          verifiedAt: computedStatus === 'VERIFIED' ? new Date() : null,
        },
      });

      return updatedRequest;
    });
  }

  async getCompanyVerificationHistory(userId: string) {
    const company = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new AppError(404, 'COMPANY_NOT_FOUND', 'Company profile not found');

    const requests = await prisma.verificationRequest.findMany({
      where: { companyProfileId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        checks: {
          orderBy: { executedAt: 'asc' },
        },
      },
    });

    return requests;
  }

  async getAdminQueue(statusFilter?: string) {
    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }

    const requests = await prisma.verificationRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          include: {
            user: { select: { email: true, createdAt: true } },
          },
        },
        checks: {
          orderBy: { executedAt: 'asc' },
        },
      },
    });

    return requests;
  }

  async reviewRequest(
    adminUserId: string,
    requestId: string,
    decision: { status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED'; adminNotes: string }
  ) {
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { company: true },
    });

    if (!request) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Verification request not found');
    }

    return await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: decision.status,
          reviewedById: adminUserId,
          reviewedAt: new Date(),
          adminNotes: decision.adminNotes,
        },
      });

      await tx.companyProfile.update({
        where: { id: request.companyProfileId },
        data: {
          verificationStatus: decision.status,
          verifiedAt: decision.status === 'VERIFIED' ? new Date() : null,
          verificationNotes: decision.adminNotes,
        },
      });

      // If suspended or rejected, pause any active internships
      if (decision.status === 'SUSPENDED' || decision.status === 'REJECTED') {
        await tx.internship.updateMany({
          where: { companyProfileId: request.companyProfileId, status: 'PUBLISHED' },
          data: { status: 'PAUSED' },
        });
      }

      // Log action in audit logs
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: `COMPANY_VERIFICATION_${decision.status}`,
          targetResource: 'verification_requests',
          targetId: requestId,
          details: {
            companyProfileId: request.companyProfileId,
            companyName: request.company.brandName,
            notes: decision.adminNotes,
            previousStatus: request.status,
            newStatus: decision.status,
          },
        },
      });

      return updatedRequest;
    });
  }
}

export const verificationService = new VerificationService();
