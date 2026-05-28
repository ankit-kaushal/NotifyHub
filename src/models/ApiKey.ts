import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
  keyId: string;
  keyHash: string;
  projectId: string;
  name: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    keyId: { type: String, required: true, unique: true, index: true },
    keyHash: { type: String, required: true, unique: true },
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
);

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
