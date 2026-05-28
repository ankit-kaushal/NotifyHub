import { getWhatsAppProvider } from '../providers/whatsapp';
import type { SendResult } from '../types';
import type { WhatsAppMediaInput, WhatsAppSendInput } from '../providers/whatsapp/types';

export async function sendWhatsApp(input: WhatsAppSendInput): Promise<SendResult> {
  const provider = getWhatsAppProvider();

  if (!provider) {
    return {
      success: false,
      error:
        'No WhatsApp provider configured. Set WIREWEB_API_KEY (WireWeb) or WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN (Meta) or CALLMEBOT_API_KEY (CallMeBot).',
      provider: 'none',
    };
  }

  return provider.send(input);
}

export async function sendWhatsAppMedia(input: WhatsAppMediaInput): Promise<SendResult> {
  const provider = getWhatsAppProvider();

  if (!provider) {
    return {
      success: false,
      error:
        'No WhatsApp provider configured. Set WIREWEB_API_KEY (WireWeb) or WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN (Meta) or CALLMEBOT_API_KEY (CallMeBot).',
      provider: 'none',
    };
  }

  if (!provider.sendMedia) {
    return {
      success: false,
      error: `${provider.name} does not support media sending`,
      provider: provider.name,
    };
  }

  return provider.sendMedia(input);
}
