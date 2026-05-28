import mongoose, { Document, Schema } from 'mongoose';
import type { NotificationChannel, NotificationStatus } from '../types';

export interface INotificationLog extends Document {
  projectId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  provider?: string;
  externalId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
  {
    projectId: { type: String, required: true, index: true },
    channel: { type: String, enum: ['email', 'whatsapp'], required: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], required: true, index: true },
    recipient: { type: String, required: true },
    subject: { type: String },
    body: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    provider: { type: String },
    externalId: { type: String },
    error: { type: String },
  },
  { timestamps: true },
);

notificationLogSchema.index({ projectId: 1, createdAt: -1 });

export const NotificationLog = mongoose.model<INotificationLog>(
  'NotificationLog',
  notificationLogSchema,
);
