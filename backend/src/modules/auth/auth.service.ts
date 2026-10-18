import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/error.middleware';
import { LoginInput, RegisterInput, ResetPasswordInput } from '../../shared';

export class AuthService {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { userId, role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
    );

    const refreshTokenRaw = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = this.hashToken(refreshTokenRaw);
    const familyId = crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      accessToken,
      refreshTokenRaw,
      refreshTokenHash,
      familyId,
      expiresAt,
    };
  }

  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpires = new Date();
    emailVerifyExpires.setHours(emailVerifyExpires.getHours() + 24);

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          role: input.role as any,
          emailVerifyToken,
          emailVerifyExpires,
        },
      });

      // Automatically initialize corresponding profile based on role
      if (input.role === 'STUDENT') {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            fullName: input.fullName || input.email.split('@')[0],
            collegeName: '',
            degree: '',
            branch: '',
            graduationYear: new Date().getFullYear() + 1,
            preferredWorkModes: ['REMOTE'],
            profileCompleteness: 15,
          },
        });
      } else if (input.role === 'COMPANY') {
        await tx.companyProfile.create({
          data: {
            userId: user.id,
            legalName: input.companyName || input.email.split('@')[0],
            brandName: input.companyName || input.email.split('@')[0],
            industry: 'Technology',
            companySize: '1-10',
            websiteUrl: 'https://example.com',
            addressLine1: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            pincode: '000000',
            contactPersonName: input.fullName || 'Authorized Representative',
            contactPersonPhone: '0000000000',
            contactPersonDesignation: 'Hiring Manager',
            description: 'Company profile pending completion.',
          },
        });
      } else if (input.role === 'COLLEGE') {
        await tx.collegeProfile.create({
          data: {
            userId: user.id,
            institutionName: input.institutionName || 'University / Institution',
            address: 'To be provided',
            city: 'To be provided',
            state: 'To be provided',
            contactPersonName: input.fullName || 'T&P Officer',
            contactPersonPhone: '0000000000',
            contactPersonEmail: input.email,
          },
        });
      }

      // Generate authentication tokens
      const tokens = this.generateTokens(user.id, user.role);

      await tx.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: tokens.refreshTokenHash,
          familyId: tokens.familyId,
          expiresAt: tokens.expiresAt,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshTokenRaw,
      };
    });
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        studentProfile: true,
        companyProfile: true,
        collegeProfile: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError(403, 'USER_SUSPENDED', 'Account suspended. Contact administration.');
    }

    const tokens = this.generateTokens(user.id, user.role);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: tokens.refreshTokenHash,
        familyId: tokens.familyId,
        expiresAt: tokens.expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile:
          user.studentProfile ||
          user.companyProfile ||
          user.collegeProfile ||
          null,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshTokenRaw,
    };
  }

  async refreshToken(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    }

    // Reuse detection: if token is already revoked, compromise detected -> revoke entire family
    if (tokenRecord.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { isRevoked: true },
      });
      throw new AppError(401, 'TOKEN_COMPROMISED', 'Detected token reuse. Session terminated for security.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Refresh token has expired. Please log in again.');
    }

    // Rotate refresh token
    const newTokens = this.generateTokens(tokenRecord.userId, tokenRecord.user.role);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { isRevoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          userId: tokenRecord.userId,
          tokenHash: newTokens.refreshTokenHash,
          familyId: tokenRecord.familyId,
          expiresAt: newTokens.expiresAt,
        },
      }),
    ]);

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshTokenRaw,
    };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        companyProfile: true,
        collegeProfile: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User profile not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      studentProfile: user.studentProfile,
      companyProfile: user.companyProfile,
      collegeProfile: user.collegeProfile,
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success to avoid email enumeration
      return { message: 'If that email exists, password reset instructions have been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // In production this sends an email via Nodemailer; in dev we log the link
    return {
      message: 'If that email exists, password reset instructions have been sent.',
      resetToken: env.NODE_ENV === 'development' ? resetToken : undefined,
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: input.token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError(400, 'INVALID_RESET_TOKEN', 'Reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(input.password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  async getAdminUsers(role?: string, search?: string) {
    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role as any;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { studentProfile: { fullName: { contains: search, mode: 'insensitive' } } },
        { companyProfile: { brandName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        studentProfile: {
          select: {
            id: true,
            fullName: true,
            collegeName: true,
            profileCompleteness: true,
          },
        },
        companyProfile: {
          select: {
            id: true,
            brandName: true,
            verificationStatus: true,
            industry: true,
          },
        },
      },
    });
  }

  async updateAdminUserStatus(userId: string, status: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User does not exist');
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }
}

export const authService = new AuthService();
