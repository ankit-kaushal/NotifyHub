import type { Request, Response } from 'express';
import { createApp } from '../src/app';
import { initializeInfrastructure } from '../src/bootstrap';

const app = createApp();

export default async function handler(req: Request, res: Response): Promise<void> {
  await initializeInfrastructure();
  app(req, res);
}

