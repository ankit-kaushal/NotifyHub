import { ApiKey } from '../models/ApiKey';
import { NotFoundError } from '../utils/errors';
import { generateApiKey } from '../utils/crypto';

export async function createApiKey(projectId: string, name: string) {
  const { rawKey, keyId, keyHash } = generateApiKey();

  await ApiKey.create({
    keyId,
    keyHash,
    projectId,
    name,
    isActive: true,
  });

  return {
    keyId,
    projectId,
    name,
    apiKey: rawKey,
    hint: 'Store this key securely. It will not be shown again.',
  };
}

export async function revokeApiKey(keyId: string) {
  const updated = await ApiKey.findOneAndUpdate(
    { keyId },
    { $set: { isActive: false } },
    { new: true },
  );

  if (!updated) {
    throw new NotFoundError(`API key not found: ${keyId}`);
  }

  return { keyId, revoked: true };
}

export async function listApiKeys(projectId?: string) {
  const filter = projectId ? { projectId } : {};
  return ApiKey.find(filter)
    .select('keyId projectId name isActive lastUsedAt createdAt')
    .sort({ createdAt: -1 })
    .lean();
}

export async function ensureBootstrapApiKey(): Promise<void> {
  const count = await ApiKey.countDocuments();
  if (count > 0) return;

  const projectId = process.env.BOOTSTRAP_PROJECT_ID ?? 'default';
  const name = 'bootstrap';
  const { rawKey, keyId, keyHash } = generateApiKey();

  await ApiKey.create({ keyId, keyHash, projectId, name, isActive: true });

  console.info('[bootstrap] No API keys found. Created initial key:');
  console.info(`  Project: ${projectId}`);
  console.info(`  API Key: ${rawKey}`);
  console.info('  Save this key — it will not be shown again.');
}
