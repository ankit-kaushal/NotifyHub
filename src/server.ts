import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { ensureBootstrapApiKey } from './services/apiKey.service';

async function main(): Promise<void> {
  await connectDatabase();
  await ensureBootstrapApiKey();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.info(`[server] NotifyHub running on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    console.info(`[server] Received ${signal}, shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((error) => {
  console.error('[server] Failed to start:', error);
  process.exit(1);
});
