import { EmailTemplate, IEmailTemplate } from '../models/EmailTemplate';
import { isValidObjectId, toObjectId } from '../utils/objectId';

export interface CreateTemplateInput {
  projectId: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  description?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  subject?: string;
  html?: string;
  text?: string;
  description?: string;
  isActive?: boolean;
}

export async function createTemplate(input: CreateTemplateInput): Promise<IEmailTemplate> {
  return EmailTemplate.create(input);
}

export async function findTemplateById(
  projectId: string,
  id: string,
): Promise<IEmailTemplate | null> {
  if (!isValidObjectId(id)) return null;
  return EmailTemplate.findOne({ _id: toObjectId(id), projectId, isActive: true }).lean();
}

export async function findTemplateByIdIncludingInactive(
  projectId: string,
  id: string,
): Promise<IEmailTemplate | null> {
  if (!isValidObjectId(id)) return null;
  return EmailTemplate.findOne({ _id: toObjectId(id), projectId }).lean();
}

export async function listTemplates(projectId: string): Promise<IEmailTemplate[]> {
  return EmailTemplate.find({ projectId }).sort({ createdAt: -1 }).lean() as Promise<IEmailTemplate[]>;
}

export async function updateTemplateById(
  projectId: string,
  id: string,
  input: UpdateTemplateInput,
): Promise<IEmailTemplate | null> {
  if (!isValidObjectId(id)) return null;
  return EmailTemplate.findOneAndUpdate(
    { _id: toObjectId(id), projectId },
    { $set: input },
    { new: true },
  ).lean();
}

export async function deleteTemplateById(projectId: string, id: string): Promise<boolean> {
  if (!isValidObjectId(id)) return false;
  const result = await EmailTemplate.deleteOne({ _id: toObjectId(id), projectId });
  return result.deletedCount > 0;
}
