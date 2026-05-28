import { Request, Response, NextFunction } from 'express';
import * as apiKeyService from '../services/apiKey.service';

export async function createApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await apiKeyService.createApiKey(req.body.projectId, req.body.name);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function revokeApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await apiKeyService.revokeApiKey(req.body.keyId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function listApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.query.projectId as string | undefined;
    const keys = await apiKeyService.listApiKeys(projectId);
    res.json({ success: true, data: keys });
  } catch (error) {
    next(error);
  }
}
