import { connectDatabase } from './config/database';
import { env } from './config/env';
import { ensureBootstrapApiKey } from './services/apiKey.service';

let initPromise: Promise<void> | null = null;

export function initializeInfrastructure(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDatabase();
      if (env.bootstrapApiKeys) {
        await ensureBootstrapApiKey();
      }
    })();
  }

  return initPromise;
}

