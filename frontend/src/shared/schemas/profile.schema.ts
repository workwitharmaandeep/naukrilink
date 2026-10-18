import { z } from 'zod';
import { SKILL_LEVELS, WORK_MODES } from '../constants';

export const studentProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(255),
  phone: z.string().trim().regex(/^[0-9+ -]{7,15}$/, 'Invalid phone number').optional().nullable(),
  collegeName: z.string().trim().min(2, 'College name is required').max(255),
  degree: z.string().trim().min(2, 'Degree is required').max(128),
  branch: z.string().trim().min(2, 'Branch/Specialization is required').max(128),
  graduationYear: z.coerce.number().int().min(2020).max(2035),
  cgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  locationCity: z.string().trim().max(128).optional().nullable(),
  locationState: z.string().trim().max(128).optional().nullable(),
  preferredWorkModes: z.array(z.enum(WORK_MODES)).min(1, 'Select at least one preferred work mode'),
  preferredDurationMonths: z.coerce.number().int().min(1).max(24).optional().nullable(),
  availabilityDate: z.string().optional().nullable(),
  githubUrl: z.string().trim().url('Invalid GitHub URL').optional().or(z.literal('')).nullable(),
  linkedinUrl: z.string().trim().url('Invalid LinkedIn URL').optional().or(z.literal('')).nullable(),
  portfolioUrl: z.string().trim().url('Invalid Portfolio URL').optional().or(z.literal('')).nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  skills: z
    .array(
      z.object({
        skillId: z.string().uuid(),
        declaredLevel: z.enum(SKILL_LEVELS),
      })
    )
    .optional(),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

export const companyProfileSchema = z.object({
  legalName: z.string().trim().min(2, 'Legal company name is required').max(255),
  brandName: z.string().trim().min(2, 'Brand/Trade name is required').max(255),
  industry: z.string().trim().min(2, 'Industry is required').max(128),
  companySize: z.string().trim().min(1, 'Company size is required').max(64),
  websiteUrl: z.string().trim().url('Valid website URL is required (e.g. https://company.com)'),
  addressLine1: z.string().trim().min(3, 'Address is required').max(255),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(2, 'City is required').max(128),
  state: z.string().trim().min(2, 'State is required').max(128),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
  gstin: z
    .string()
    .trim()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)'
    )
    .optional()
    .or(z.literal(''))
    .nullable(),
  cin: z
    .string()
    .trim()
    .regex(
      /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
      'Invalid CIN format (e.g. U72200MH2020PTC123456)'
    )
    .optional()
    .or(z.literal(''))
    .nullable(),
  contactPersonName: z.string().trim().min(2, 'Contact person name is required').max(255),
  contactPersonPhone: z.string().trim().regex(/^[0-9+ -]{7,15}$/, 'Invalid phone number'),
  contactPersonDesignation: z.string().trim().min(2, 'Designation is required').max(128),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
