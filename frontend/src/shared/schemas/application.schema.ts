import { z } from 'zod';
import { APPLICATION_STATUSES } from '../constants';

export const applyInternshipSchema = z.object({
  internshipId: z.string().uuid('Invalid internship ID'),
  coverNote: z.string().trim().max(1000).optional().nullable(),
});

export type ApplyInternshipInput = z.infer<typeof applyInternshipSchema>;

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
