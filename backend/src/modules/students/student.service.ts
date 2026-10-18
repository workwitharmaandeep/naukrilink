import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { StudentProfileInput } from '../../shared';

export class StudentService {
  private calculateCompleteness(profile: any, skillsCount: number): number {
    let score = 0;
    if (profile.fullName && profile.fullName.trim().length > 1) score += 10;
    if (profile.collegeName && profile.degree && profile.branch) score += 20;
    if (profile.phone) score += 10;
    if (profile.locationCity && profile.locationState) score += 10;
    if (profile.preferredWorkModes && profile.preferredWorkModes.length > 0) score += 10;
    if (profile.bio && profile.bio.trim().length >= 10) score += 10;
    if (profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl) score += 10;
    if (profile.resumeUrl) score += 10;
    if (skillsCount > 0) score += 10;
    return Math.min(100, score);
  }

  async getProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        college: true,
      },
    });

    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Student profile does not exist');
    }

    return profile;
  }

  async updateProfile(userId: string, data: StudentProfileInput) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { skills: true },
    });

    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Student profile does not exist');
    }

    // Handle skills update if passed
    if (data.skills && data.skills.length > 0) {
      for (const item of data.skills) {
        await prisma.studentSkill.upsert({
          where: {
            studentProfileId_skillId: {
              studentProfileId: profile.id,
              skillId: item.skillId,
            },
          },
          update: {
            declaredLevel: item.declaredLevel as any,
          },
          create: {
            studentProfileId: profile.id,
            skillId: item.skillId,
            declaredLevel: item.declaredLevel as any,
          },
        });
      }
    }

    const currentSkills = await prisma.studentSkill.count({
      where: { studentProfileId: profile.id },
    });

    const completeness = this.calculateCompleteness(
      {
        ...profile,
        ...data,
      },
      currentSkills
    );

    const updated = await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        collegeName: data.collegeName,
        degree: data.degree,
        branch: data.branch,
        graduationYear: data.graduationYear,
        cgpa: data.cgpa,
        locationCity: data.locationCity,
        locationState: data.locationState,
        preferredWorkModes: data.preferredWorkModes as any,
        preferredDurationMonths: data.preferredDurationMonths,
        availabilityDate: data.availabilityDate ? new Date(data.availabilityDate) : null,
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        bio: data.bio,
        profileCompleteness: completeness,
      },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    return updated;
  }

  async addSkill(userId: string, skillId: string, declaredLevel: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');

    const studentSkill = await prisma.studentSkill.upsert({
      where: {
        studentProfileId_skillId: {
          studentProfileId: profile.id,
          skillId,
        },
      },
      update: {
        declaredLevel: declaredLevel as any,
      },
      create: {
        studentProfileId: profile.id,
        skillId,
        declaredLevel: declaredLevel as any,
      },
      include: { skill: true },
    });

    // Recompute completeness
    const count = await prisma.studentSkill.count({ where: { studentProfileId: profile.id } });
    const completeness = this.calculateCompleteness(profile, count);
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { profileCompleteness: completeness },
    });

    return studentSkill;
  }

  async removeSkill(userId: string, studentSkillId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');

    await prisma.studentSkill.deleteMany({
      where: {
        id: studentSkillId,
        studentProfileId: profile.id,
      },
    });

    const count = await prisma.studentSkill.count({ where: { studentProfileId: profile.id } });
    const completeness = this.calculateCompleteness(profile, count);
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { profileCompleteness: completeness },
    });

    return { message: 'Skill removed successfully' };
  }

  async updateResume(userId: string, resumeUrl: string, resumeFilename: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');

    const count = await prisma.studentSkill.count({ where: { studentProfileId: profile.id } });
    const completeness = this.calculateCompleteness({ ...profile, resumeUrl }, count);

    return await prisma.studentProfile.update({
      where: { id: profile.id },
      data: {
        resumeUrl,
        resumeFilename,
        profileCompleteness: completeness,
      },
    });
  }
}

export const studentService = new StudentService();
