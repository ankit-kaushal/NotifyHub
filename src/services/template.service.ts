import Handlebars from 'handlebars';
import * as templateRepo from '../repositories/template.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface RenderedEmail {
  subject: string;
  html: string;
  text?: string;
}

function renderString(template: string, variables: Record<string, unknown>): string {
  try {
    return Handlebars.compile(template, { strict: false })(variables);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Template render failed';
    throw new ValidationError(`Failed to render template: ${message}`);
  }
}

export async function createTemplate(
  projectId: string,
  input: Omit<templateRepo.CreateTemplateInput, 'projectId'>,
) {
  return templateRepo.createTemplate({ ...input, projectId });
}

export async function getTemplate(projectId: string, templateId: string) {
  const template = await templateRepo.findTemplateByIdIncludingInactive(projectId, templateId);
  if (!template) {
    throw new NotFoundError(`Email template not found: ${templateId}`);
  }
  return template;
}

export async function listTemplates(projectId: string) {
  return templateRepo.listTemplates(projectId);
}

export async function updateTemplate(
  projectId: string,
  templateId: string,
  input: templateRepo.UpdateTemplateInput,
) {
  const updated = await templateRepo.updateTemplateById(projectId, templateId, input);
  if (!updated) {
    throw new NotFoundError(`Email template not found: ${templateId}`);
  }
  return updated;
}

export async function deleteTemplate(projectId: string, templateId: string) {
  const deleted = await templateRepo.deleteTemplateById(projectId, templateId);
  if (!deleted) {
    throw new NotFoundError(`Email template not found: ${templateId}`);
  }
  return { templateId, deleted: true };
}

export async function renderEmailTemplate(
  projectId: string,
  templateId: string,
  variables: Record<string, unknown> = {},
  subjectOverride?: string,
): Promise<RenderedEmail> {
  const template = await templateRepo.findTemplateById(projectId, templateId);
  if (!template) {
    throw new NotFoundError(`Email template not found: ${templateId}`);
  }

  const subject = subjectOverride
    ? renderString(subjectOverride, variables)
    : renderString(template.subject, variables);

  const html = renderString(template.html, variables);
  const text = template.text ? renderString(template.text, variables) : undefined;

  return { subject, html, text };
}
