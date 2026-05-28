import { env } from '../../config/env';
import type { SendResult } from '../../types';
import type { WhatsAppProvider, WhatsAppSendInput } from './types';

/**
 * CallMeBot — free personal WhatsApp API for development/testing.
 * Register at https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export class CallMeBotWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'callmebot';

  isConfigured(): boolean {
    return Boolean(env.whatsapp.callMeBotApiKey);
  }

  async send(input: WhatsAppSendInput): Promise<SendResult> {
    const apiKey = env.whatsapp.callMeBotApiKey;
    if (!apiKey) {
      return {
        success: false,
        error: 'CallMeBot is not configured',
        provider: this.name,
      };
    }

    const phone = (env.whatsapp.callMeBotPhone || input.to).replace(/\D/g, '');

    try {
      const params = new URLSearchParams({
        phone,
        text: input.message,
        apikey: apiKey,
      });

      const response = await fetch(
        `https://api.callmebot.com/whatsapp.php?${params.toString()}`,
        { method: 'GET' },
      );

      const text = await response.text();

      if (!response.ok || text.toLowerCase().includes('error')) {
        return {
          success: false,
          error: text || `HTTP ${response.status}`,
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: `callmebot-${Date.now()}`,
        provider: this.name,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CallMeBot request failed',
        provider: this.name,
      };
    }
  }
}
