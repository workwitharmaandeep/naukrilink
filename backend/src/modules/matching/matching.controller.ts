import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { matchingService, StudentMatchProfile, InternshipMatchProfile } from './matching.service';
import { InternshipStatus } from '@prisma/client';

export class MatchingController {
  private async loadStudentMatchProfile(userId: string): Promise<StudentMatchProfile> {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Student profile not found. Please complete profile.');
    }

    return {
      id: student.id,
      degree: student.degree,
      branch: student.branch,
      graduationYear: student.graduationYear,
      cgpa: student.cgpa,
      locationCity: student.locationCity,
      locationState: student.locationState,
      preferredWorkModes: student.preferredWorkModes,
      skills: student.skills.map((s) => ({
        skillId: s.skillId,
        skillName: s.skill.name,
        declaredLevel: s.declaredLevel,
        verifiedScore: s.verifiedScore,
      })),
    };
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await this.loadStudentMatchProfile(req.user!.userId);

      // Fetch all published internships
      const internships = await prisma.internship.findMany({
        where: {
          status: InternshipStatus.PUBLISHED,
          deadline: { gte: new Date() },
        },
        include: {
          company: true,
          requiredSkills: {
            include: { skill: true },
          },
        },
      });

      const scoredList = internships.map((item) => {
        const internProfile: InternshipMatchProfile = {
          id: item.id,
          title: item.title,
          category: item.category,
          eligibilityDegrees: item.eligibilityDegrees,
          eligibilityBranches: item.eligibilityBranches,
          eligibilityGraduationYears: item.eligibilityGraduationYears,
          minCgpa: item.minCgpa,
          workMode: item.workMode,
          locationCity: item.locationCity,
          locationState: item.locationState,
          companyVerificationStatus: item.company.verificationStatus,
          deadline: item.deadline,
          requiredSkills: item.requiredSkills.map((rs) => ({
            skillId: rs.skillId,
            skillName: rs.skill.name,
            minLevel: rs.minLevel,
            isRequired: rs.isRequired,
          })),
        };

        const match = matchingService.calculateMatch(student, internProfile);

        return {
          ...item,
          matchResult: match,
        };
      });

      // Sort by match percentage descending
      scoredList.sort((a, b) => b.matchResult.matchPercentage - a.matchResult.matchPercentage);

      return res.status(200).json({ data: scoredList });
    } catch (error) {
      return next(error);
    }
  }

  async getMatchForInternship(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const student = await this.loadStudentMatchProfile(req.user!.userId);

      const item = await prisma.internship.findUnique({
        where: { id },
        include: {
          company: true,
          requiredSkills: {
            include: { skill: true },
          },
        },
      });

      if (!item) {
        throw new AppError(404, 'INTERNSHIP_NOT_FOUND', 'Internship not found');
      }

      const internProfile: InternshipMatchProfile = {
        id: item.id,
        title: item.title,
        category: item.category,
        eligibilityDegrees: item.eligibilityDegrees,
        eligibilityBranches: item.eligibilityBranches,
        eligibilityGraduationYears: item.eligibilityGraduationYears,
        minCgpa: item.minCgpa,
        workMode: item.workMode,
        locationCity: item.locationCity,
        locationState: item.locationState,
        companyVerificationStatus: item.company.verificationStatus,
        deadline: item.deadline,
        requiredSkills: item.requiredSkills.map((rs) => ({
          skillId: rs.skillId,
          skillName: rs.skill.name,
          minLevel: rs.minLevel,
          isRequired: rs.isRequired,
        })),
      };

      const match = matchingService.calculateMatch(student, internProfile);

      return res.status(200).json({ data: match });
    } catch (error) {
      return next(error);
    }
  }
}

export const matchingController = new MatchingController();
