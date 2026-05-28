import * as notificationRepo from '../repositories/notification.repository';
import { sendEmail, type SendEmailInput } from './email.service';
import { renderEmailTemplate } from './template.service';
import { sendWhatsApp, sendWhatsAppMedia } from './whatsapp.service';
import type { SendResult } from '../types';

export interface SendEmailRequest extends SendEmailInput {
  projectId: string;
}

export interface SendTemplateEmailRequest {
  projectId: string;
  to: string | string[];
  templateId: string;
  variables?: Record<string, unknown>;
  subject?: string;
  replyTo?: string;
}

export interface SendWhatsAppRequest {
  projectId: string;
  to: string;
  message: string;
}

export interface SendWhatsAppMediaRequest {
  projectId: string;
  to: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
  fileName?: string;
  fileBuffer: Buffer;
  mimeType?: string;
}

async function logNotification(
  projectId: string,
  channel: 'email' | 'whatsapp',
  recipient: string,
  body: string,
  result: SendResult,
  extras?: { subject?: string; metadata?: Record<string, unknown> },
) {
  return notificationRepo.createNotificationLog({
    projectId,
    channel,
    status: result.success ? 'sent' : 'failed',
    recipient,
    body,
    subject: extras?.subject,
    metadata: extras?.metadata,
    provider: result.provider,
    externalId: result.messageId,
    error: result.error,
  });
}

export async function sendEmailNotification(input: SendEmailRequest) {
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const recipientLabel = recipients.join(', ');
  const body = input.html ?? input.text ?? '';

  const result = await sendEmail(input);
  const log = await logNotification(input.projectId, 'email', recipientLabel, body, result, {
    subject: input.subject,
    metadata: { recipients },
  });

  return { result, logId: log._id.toString() };
}

export async function sendTemplateEmailNotification(input: SendTemplateEmailRequest) {
  const rendered = await renderEmailTemplate(
    input.projectId,
    input.templateId,
    input.variables ?? {},
    input.subject,
  );

  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const recipientLabel = recipients.join(', ');

  const result = await sendEmail({
    to: input.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    replyTo: input.replyTo,
  });

  const log = await logNotification(
    input.projectId,
    'email',
    recipientLabel,
    rendered.html,
    result,
    {
      subject: rendered.subject,
      metadata: {
        recipients,
        templateId: input.templateId,
        variables: input.variables ?? {},
      },
    },
  );

  return { result, logId: log._id.toString(), templateId: input.templateId };
}

export async function sendWhatsAppNotification(input: SendWhatsAppRequest) {
  const result = await sendWhatsApp({ to: input.to, message: input.message });
  const log = await logNotification(input.projectId, 'whatsapp', input.to, input.message, result);

  return { result, logId: log._id.toString() };
}

export async function sendWhatsAppMediaNotification(input: SendWhatsAppMediaRequest) {
  const result = await sendWhatsAppMedia({
    to: input.to,
    mediaType: input.mediaType,
    caption: input.caption,
    fileName: input.fileName,
    fileBuffer: input.fileBuffer,
    mimeType: input.mimeType,
  });

  const log = await logNotification(
    input.projectId,
    'whatsapp',
    input.to,
    input.caption ?? `[media:${input.mediaType}]`,
    result,
    {
      metadata: {
        mediaType: input.mediaType,
        fileName: input.fileName,
      },
    },
  );

  return { result, logId: log._id.toString() };
}

export async function sendBatch(
  projectId: string,
  items: Array<
    | { channel: 'email'; to: string | string[]; subject: string; text?: string; html?: string }
    | { channel: 'whatsapp'; to: string; message: string }
  >,
) {
  const results = [];

  for (const item of items) {
    if (item.channel === 'email') {
      const { result, logId } = await sendEmailNotification({
        projectId,
        to: item.to,
        subject: item.subject,
        text: item.text,
        html: item.html,
      });
      results.push({ channel: 'email' as const, success: result.success, logId, error: result.error });
    } else {
      const { result, logId } = await sendWhatsAppNotification({
        projectId,
        to: item.to,
        message: item.message,
      });
      results.push({ channel: 'whatsapp' as const, success: result.success, logId, error: result.error });
    }
  }

  return results;
}

export async function getLogs(
  projectId: string,
  filter: { channel?: 'email' | 'whatsapp'; status?: 'pending' | 'sent' | 'failed'; page: number; limit: number },
) {
  return notificationRepo.listNotificationLogs({ projectId, ...filter });
}
