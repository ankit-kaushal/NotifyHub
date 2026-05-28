import { NotificationLog, INotificationLog } from '../models/NotificationLog';
import type { NotificationChannel, NotificationStatus } from '../types';

export interface CreateLogInput {
  projectId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  body: string;
  subject?: string;
  metadata?: Record<string, unknown>;
  provider?: string;
  externalId?: string;
  error?: string;
}

export interface ListLogsFilter {
  projectId: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  page: number;
  limit: number;
}

export async function createNotificationLog(input: CreateLogInput): Promise<INotificationLog> {
  return NotificationLog.create(input);
}

export async function listNotificationLogs(
  filter: ListLogsFilter,
): Promise<{ logs: INotificationLog[]; total: number }> {
  const query: Record<string, unknown> = { projectId: filter.projectId };
  if (filter.channel) query.channel = filter.channel;
  if (filter.status) query.status = filter.status;

  const skip = (filter.page - 1) * filter.limit;

  const [logs, total] = await Promise.all([
    NotificationLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(filter.limit).lean(),
    NotificationLog.countDocuments(query),
  ]);

  return { logs: logs as INotificationLog[], total };
}
