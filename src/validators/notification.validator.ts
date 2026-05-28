import { z } from 'zod';
import { mongoObjectIdSchema } from './template.validator';

const emailRecipients = z.union([z.string().email(), z.array(z.string().email()).min(1)]);

const sendRawEmailSchema = z
  .object({
    to: emailRecipients,
    subject: z.string().min(1).max(500),
    text: z.string().min(1).optional(),
    html: z.string().min(1).optional(),
    replyTo: z.string().email().optional(),
  })
  .refine((data) => data.text || data.html, {
    message: 'Either text or html body is required',
  });

const sendTemplateEmailSchema = z.object({
  to: emailRecipients,
  templateId: mongoObjectIdSchema,
  variables: z.record(z.string(), z.unknown()).optional().default({}),
  subject: z.string().min(1).max(500).optional(),
  replyTo: z.string().email().optional(),
});

export const sendEmailSchema = z.union([sendRawEmailSchema, sendTemplateEmailSchema]);

export const sendWhatsAppSchema = z.object({
  to: z.string().min(8).max(20),
  message: z.string().min(1).max(4096),
});

export const sendWhatsAppMediaSchema = z.object({
  to: z.string().min(8).max(20),
  mediaType: z.enum(['image', 'video', 'audio', 'document']),
  caption: z.string().max(1024).optional(),
  fileName: z.string().min(1).max(255).optional(),
});

export const sendBatchSchema = z.object({
  notifications: z
    .array(
      z.discriminatedUnion('channel', [
        z.object({
          channel: z.literal('email'),
          to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
          subject: z.string().min(1).max(500),
          text: z.string().optional(),
          html: z.string().optional(),
        }),
        z.object({
          channel: z.literal('whatsapp'),
          to: z.string().min(8).max(20),
          message: z.string().min(1).max(4096),
        }),
      ]),
    )
    .min(1)
    .max(50),
});

export const listLogsSchema = z.object({
  channel: z.enum(['email', 'whatsapp']).optional(),
  status: z.enum(['pending', 'sent', 'failed']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export const createApiKeySchema = z.object({
  projectId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(1).max(100),
});

export const revokeApiKeySchema = z.object({
  keyId: z.string().min(1),
});
