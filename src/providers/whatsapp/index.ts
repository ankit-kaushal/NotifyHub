import { CallMeBotWhatsAppProvider } from './callmebot.provider';
import { MetaWhatsAppProvider } from './meta.provider';
import { WireWebWhatsAppProvider } from './wireweb.provider';
import type { WhatsAppProvider } from './types';

const wirewebProvider = new WireWebWhatsAppProvider();
const metaProvider = new MetaWhatsAppProvider();
const callMeBotProvider = new CallMeBotWhatsAppProvider();

/** Prefer WireWeb (if configured) for your selected provider */
export function getWhatsAppProvider(): WhatsAppProvider | null {
  if (wirewebProvider.isConfigured()) return wirewebProvider;
  if (metaProvider.isConfigured()) return metaProvider;
  if (callMeBotProvider.isConfigured()) return callMeBotProvider;
  return null;
}

export function getConfiguredWhatsAppProviders(): string[] {
  const providers: string[] = [];
  if (wirewebProvider.isConfigured()) providers.push(wirewebProvider.name);
  if (metaProvider.isConfigured()) providers.push(metaProvider.name);
  if (callMeBotProvider.isConfigured()) providers.push(callMeBotProvider.name);
  return providers;
}
