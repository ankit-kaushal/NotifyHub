import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import type { SendResult } from '../types';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.email.user,
        pass: env.email.password.replace(/\s/g, ''),
      },
    });
  }
  return transporter;
}

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  try {
    const info = await getTransporter().sendMail({
      from: `"NotifyHub" <${env.email.from}>`,
      to: Array.isArray(input.to) ? input.to.join(', ') : input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });

    return {
      success: true,
      messageId: info.messageId,
      provider: 'nodemailer-gmail',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: message, provider: 'nodemailer-gmail' };
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await getTransporter().verify();
    return true;
  } catch {
    return false;
  }
}
