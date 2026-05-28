import { Request, Response, NextFunction } from 'express';
import * as templateService from '../services/template.service';
import type { templateIdParamSchema } from '../validators/template.validator';
import type { z } from 'zod';

type TemplateIdParams = z.infer<typeof templateIdParamSchema>;

export async function createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const template = await templateService.createTemplate(req.apiKey!.projectId, req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
}

export async function listTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const templates = await templateService.listTemplates(req.apiKey!.projectId);
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
}

export async function getTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { templateId } = req.params as unknown as TemplateIdParams;
    const template = await templateService.getTemplate(req.apiKey!.projectId, templateId);
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { templateId } = req.params as unknown as TemplateIdParams;
    const template = await templateService.updateTemplate(
      req.apiKey!.projectId,
      templateId,
      req.body,
    );
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { templateId } = req.params as unknown as TemplateIdParams;
    const result = await templateService.deleteTemplate(req.apiKey!.projectId, templateId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
