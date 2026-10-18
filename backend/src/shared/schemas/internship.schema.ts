import { z } from 'zod';
import { INTERNSHIP_STATUSES, SKILL_LEVELS, WORK_MODES } from '../constants';

export const internshipSkillInputSchema = z.object({
  skillId: z.string().uuid(),
  minLevel: z.enum(SKILL_LEVELS).default('BEGINNER'),
  isRequired: z.boolean().default(true),
});

export const createInternshipSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(255),
  category: z.string().trim().min(2, 'Category is required').max(128),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  responsibilities: z.string().trim().min(10, 'Responsibilities must be specified'),
  eligibilityDegrees: z.array(z.string().trim()).default([]),
  eligibilityBranches: z.array(z.string().trim()).default([]),
  eligibilityGraduationYears: z.array(z.coerce.number().int()).default([]),
  minCgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  workMode: z.enum(WORK_MODES).default('REMOTE'),
  locationCity: z.string().trim().max(128).optional().nullable(),
  locationState: z.string().trim().max(128).optional().nullable(),
  durationMonths: z.coerce.number().int().min(1, 'Duration must be at least 1 month').max(24),
  stipendAmount: z.coerce.number().int().min(0).optional().nullable(),
  isUnpaid: z.boolean().default(false),
  openingsCount: z.coerce.number().int().min(1).default(1),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid deadline date format'),
  status: z.enum(INTERNSHIP_STATUSES).default('DRAFT'),
  requiredSkills: z.array(internshipSkillInputSchema).default([]),
});

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;

export const internshipFilterSchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  workMode: z.enum(WORK_MODES).optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  minStipend: z.coerce.number().int().optional(),
  isUnpaid: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  verifiedOnly: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'deadline', 'stipendAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type InternshipFilterQuery = z.infer<typeof internshipFilterSchema>;
