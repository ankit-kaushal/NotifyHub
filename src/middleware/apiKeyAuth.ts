import { NextFunction, Request, Response } from 'express';
import { ApiKey } from '../models/ApiKey';
import { UnauthorizedError } from '../utils/errors';
import { hashApiKey, parseApiKeyHeader } from '../utils/crypto';
import type { ApiKeyPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKeyPayload;
    }
  }
}

export async function apiKeyAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rawKey =
      parseApiKeyHeader(req.headers.authorization) ??
      parseApiKeyHeader(req.headers['x-api-key'] as string | undefined);

    if (!rawKey) {
      throw new UnauthorizedError('API key required. Use Authorization: Bearer <key> or X-API-Key header.');
    }

    const keyHash = hashApiKey(rawKey);
    const record = await ApiKey.findOne({ keyHash, isActive: true }).lean();

    if (!record) {
      throw new UnauthorizedError();
    }

    req.apiKey = {
      projectId: record.projectId,
      name: record.name,
      keyId: record.keyId,
    };

    void ApiKey.updateOne({ _id: record._id }, { $set: { lastUsedAt: new Date() } });

    next();
  } catch (error) {
    next(error);
  }
}
