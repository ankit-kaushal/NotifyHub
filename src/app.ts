import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

export function createApp() {
  const app = express();
  const isAllowAll = env.corsOrigins.length === 0;

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: isAllowAll ? true : env.corsOrigins,
      credentials: false,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    }),
  );

  app.use(routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
