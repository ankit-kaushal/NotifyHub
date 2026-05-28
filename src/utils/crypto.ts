import { createHash, randomBytes } from 'crypto';

const API_KEY_PREFIX = 'nh_';

export function generateApiKey(): { rawKey: string; keyId: string; keyHash: string } {
  const keyId = randomBytes(8).toString('hex');
  const secret = randomBytes(24).toString('base64url');
  const rawKey = `${API_KEY_PREFIX}${keyId}.${secret}`;
  const keyHash = hashApiKey(rawKey);
  return { rawKey, keyId, keyHash };
}

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

export function parseApiKeyHeader(header: string | undefined): string | null {
  if (!header?.trim()) return null;

  const trimmed = header.trim();
  if (trimmed.startsWith('Bearer ')) {
    return trimmed.slice(7).trim() || null;
  }
  return trimmed;
}
