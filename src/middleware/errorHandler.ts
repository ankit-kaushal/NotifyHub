import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code ?? 'ERROR',
      message: err.message,
    });
    return;
  }

  console.error('[error]', err);

  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: env.isProduction ? 'Internal server error' : (err as Error)?.message ?? 'Unknown error',
  });
}
