import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { parseApiKeyHeader } from '../utils/crypto';

export function masterKeyAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!env.masterApiKey) {
    next(new ForbiddenError('Admin endpoints are disabled. Set MASTER_API_KEY in environment.'));
    return;
  }

  const provided =
    parseApiKeyHeader(req.headers.authorization) ??
    parseApiKeyHeader(req.headers['x-api-key'] as string | undefined);

  if (!provided || provided !== env.masterApiKey) {
    next(new UnauthorizedError('Invalid master API key'));
    return;
  }

  next();
}
