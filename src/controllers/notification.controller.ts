import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import type { listLogsSchema } from '../validators/notification.validator';
import type { z } from 'zod';

type ListLogsQuery = z.infer<typeof listLogsSchema>;

export async function sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projectId = req.apiKey!.projectId;

    if ('templateId' in req.body) {
      const { result, logId, templateId } = await notificationService.sendTemplateEmailNotification({
        projectId,
        to: req.body.to,
        templateId: req.body.templateId,
        variables: req.body.variables,
        subject: req.body.subject,
        replyTo: req.body.replyTo,
      });

      res.status(result.success ? 200 : 502).json({
        success: result.success,
        logId,
        templateId,
        messageId: result.messageId,
        provider: result.provider,
        error: result.error,
      });
      return;
    }

    const { result, logId } = await notificationService.sendEmailNotification({
      projectId,
      ...req.body,
    });

    res.status(result.success ? 200 : 502).json({
      success: result.success,
      logId,
      messageId: result.messageId,
      provider: result.provider,
      error: result.error,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendWhatsApp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { result, logId } = await notificationService.sendWhatsAppNotification({
      projectId: req.apiKey!.projectId,
      to: req.body.to,
      message: req.body.message,
    });

    res.status(result.success ? 200 : 502).json({
      success: result.success,
      logId,
      messageId: result.messageId,
      provider: result.provider,
      error: result.error,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendWhatsAppMedia(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'file is required (multipart/form-data)',
      });
      return;
    }

    const { result, logId } = await notificationService.sendWhatsAppMediaNotification({
      projectId: req.apiKey!.projectId,
      to: req.body.to,
      mediaType: req.body.mediaType,
      caption: req.body.caption,
      fileName: req.body.fileName || file.originalname,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
    });

    res.status(result.success ? 200 : 502).json({
      success: result.success,
      logId,
      messageId: result.messageId,
      provider: result.provider,
      error: result.error,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const results = await notificationService.sendBatch(
      req.apiKey!.projectId,
      req.body.notifications,
    );

    const allSuccess = results.every((r) => r.success);

    res.status(allSuccess ? 200 : 207).json({
      success: allSuccess,
      results,
    });
  } catch (error) {
    next(error);
  }
}

export async function listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query as unknown as ListLogsQuery;
    const { logs, total } = await notificationService.getLogs(req.apiKey!.projectId, query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}
