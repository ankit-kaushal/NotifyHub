import { z } from 'zod';
import { isValidObjectId } from '../utils/objectId';

export const mongoObjectIdSchema = z
  .string()
  .min(1)
  .refine((id) => isValidObjectId(id), {
    message: 'templateId must be a valid MongoDB ObjectId',
  });

export const createEmailTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(500),
  html: z.string().min(1),
  text: z.string().min(1).optional(),
  description: z.string().max(500).optional(),
});

export const updateEmailTemplateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    subject: z.string().min(1).max(500).optional(),
    html: z.string().min(1).optional(),
    text: z.string().min(1).optional(),
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

export const templateIdParamSchema = z.object({
  templateId: mongoObjectIdSchema,
});
