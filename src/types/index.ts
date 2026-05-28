export type NotificationChannel = 'email' | 'whatsapp';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface SendResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
}

export interface ApiKeyPayload {
  projectId: string;
  name: string;
  keyId: string;
}
