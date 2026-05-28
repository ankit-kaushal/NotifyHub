import type { SendResult } from '../../types';

export interface WhatsAppSendInput {
  to: string;
  message: string;
}

export interface WhatsAppMediaInput {
  to: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
  fileName?: string;
  fileBuffer: Buffer;
  mimeType?: string;
}

export interface WhatsAppProvider {
  readonly name: string;
  isConfigured(): boolean;
  send(input: WhatsAppSendInput): Promise<SendResult>;
  sendMedia?(input: WhatsAppMediaInput): Promise<SendResult>;
}
