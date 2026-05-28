import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { verifyEmailConnection } from '../services/email.service';
import { getConfiguredWhatsAppProviders } from '../providers/whatsapp';

export async function health(_req: Request, res: Response): Promise<void> {
  const dbOk = mongoose.connection.readyState === 1;
  const emailOk = await verifyEmailConnection();
  const whatsappProviders = getConfiguredWhatsAppProviders();

  const healthy = dbOk && emailOk;

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? 'ok' : 'degraded',
    checks: {
      database: dbOk ? 'up' : 'down',
      email: emailOk ? 'up' : 'down',
      whatsapp: whatsappProviders.length > 0 ? 'configured' : 'not_configured',
      whatsappProviders,
    },
    timestamp: new Date().toISOString(),
  });
}

export function readiness(_req: Request, res: Response): void {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(dbOk ? 200 : 503).json({ ready: dbOk });
}
