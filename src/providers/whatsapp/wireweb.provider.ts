import { env } from '../../config/env';
import type { SendResult } from '../../types';
import type { WhatsAppProvider, WhatsAppSendInput, WhatsAppMediaInput } from './types';

/**
 * WireWeb API contract:
 * - POST https://app.wireweb.co.in/api/v1/messages
 * - Headers: Authorization: Bearer <api-key>
 * - Body: { sessionId, to, text }
 */
export class WireWebWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'wireweb';

  isConfigured(): boolean {
    return Boolean(env.whatsapp.wirewebApiKey);
  }

  async send(input: WhatsAppSendInput): Promise<SendResult> {
    const apiKey = env.whatsapp.wirewebApiKey;
    const baseUrl = env.whatsapp.wirewebBaseUrl;
    const sessionId = env.whatsapp.wirewebSessionId;
    const sendEndpoint = env.whatsapp.wirewebSendEndpoint;

    if (!apiKey || !baseUrl) {
      return {
        success: false,
        error: 'WireWeb API is not configured (missing WIREWEB_API_KEY / WIREWEB_BASE_URL)',
        provider: this.name,
      };
    }

    const to = input.to.replace(/\D/g, '');

    try {
      const response = await fetch(`${baseUrl}${sendEndpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          to,
          text: input.message,
        }),
      });

      const data = await response
        .json()
        .catch(() => null as unknown as { id?: string; messageId?: string; message?: string; error?: string });

      if (!response.ok) {
        const message =
          (data as any)?.message ??
          (data as any)?.error ??
          `HTTP ${response.status}`;

        return {
          success: false,
          error: message,
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: (data as any)?.id ?? (data as any)?.messageId,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WireWeb request failed',
        provider: this.name,
      };
    }
  }

  async sendMedia(input: WhatsAppMediaInput): Promise<SendResult> {
    const apiKey = env.whatsapp.wirewebApiKey;
    const baseUrl = env.whatsapp.wirewebBaseUrl;
    const sessionId = env.whatsapp.wirewebSessionId;
    const mediaEndpoint = env.whatsapp.wirewebMediaEndpoint;

    if (!apiKey || !baseUrl) {
      return {
        success: false,
        error: 'WireWeb API is not configured (missing WIREWEB_API_KEY / WIREWEB_BASE_URL)',
        provider: this.name,
      };
    }

    const to = input.to.replace(/\D/g, '');

    const form = new FormData();
    form.append('sessionId', sessionId);
    form.append('to', to);
    form.append('mediaType', input.mediaType);
    if (input.caption) form.append('caption', input.caption);
    if (input.fileName) form.append('fileName', input.fileName);

    const uploadName = input.fileName ?? 'upload';
    const fileBytes = new Uint8Array(input.fileBuffer);
    const blob = new Blob([fileBytes], {
      type: input.mimeType || 'application/octet-stream',
    });
    form.append('file', blob, uploadName);

    try {
      const response = await fetch(`${baseUrl}${mediaEndpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      });

      const data = await response
        .json()
        .catch(() => null as unknown as { id?: string; messageId?: string; message?: string; error?: string });

      if (!response.ok) {
        const message =
          (data as any)?.message ??
          (data as any)?.error ??
          `HTTP ${response.status}`;

        return {
          success: false,
          error: message,
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: (data as any)?.id ?? (data as any)?.messageId,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WireWeb media request failed',
        provider: this.name,
      };
    }
  }
}

