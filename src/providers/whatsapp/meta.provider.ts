import { env } from '../../config/env';
import type { SendResult } from '../../types';
import type { WhatsAppProvider, WhatsAppSendInput } from './types';

/**
 * Meta WhatsApp Cloud API — free tier for development.
 * https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export class MetaWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'meta-cloud-api';

  isConfigured(): boolean {
    return Boolean(env.whatsapp.phoneNumberId && env.whatsapp.accessToken);
  }

  async send(input: WhatsAppSendInput): Promise<SendResult> {
    const phoneNumberId = env.whatsapp.phoneNumberId;
    const accessToken = env.whatsapp.accessToken;

    if (!phoneNumberId || !accessToken) {
      return {
        success: false,
        error: 'Meta WhatsApp Cloud API is not configured',
        provider: this.name,
      };
    }

    const to = input.to.replace(/\D/g, '');

    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: input.message },
          }),
        },
      );

      const data = (await response.json()) as {
        messages?: { id: string }[];
        error?: { message: string };
      };

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message ?? `HTTP ${response.status}`,
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Meta API request failed',
        provider: this.name,
      };
    }
  }
}
