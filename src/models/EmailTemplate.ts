import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailTemplate extends Document {
  projectId: string;
  name: string;
  subject: string;
  html: string;
  text?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 500 },
    html: { type: String, required: true },
    text: { type: String },
    description: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
