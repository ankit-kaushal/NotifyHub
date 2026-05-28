import dotenv from 'dotenv';

dotenv.config();

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function optional(name: string, fallback = ''): string {
  return process.env[name]?.trim() ?? fallback;
}

function optionalList(name: string): string[] {
  const value = process.env[name]?.trim();
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', '3000')),
  isProduction: optional('NODE_ENV', 'development') === 'production',
  corsOrigins: optionalList('CORS_ORIGINS'),

  email: {
    user: required('EMAIL_USER', process.env.EMAIL_USER),
    password: required('EMAIL_PASSWORD', process.env.EMAIL_PASSWORD),
    from: optional('EMAIL_FROM') || required('EMAIL_USER', process.env.EMAIL_USER),
  },

  mongo: {
    uri: optional('MONGODB_URI'),
    username: optional('DB_USERNAME'),
    password: optional('DB_PASSWORD'),
    cluster: optional('DB_CLUSTER'),
    name: optional('DB_NAME'),
  },

  /** Protects POST /v1/admin/api-keys — set a strong secret in production */
  masterApiKey: optional('MASTER_API_KEY'),
  bootstrapApiKeys: optional('BOOTSTRAP_API_KEYS', 'true') !== 'false',

  whatsapp: {
    /** Meta WhatsApp Cloud API (free tier for development) */
    phoneNumberId: optional('WHATSAPP_PHONE_NUMBER_ID'),
    accessToken: optional('WHATSAPP_ACCESS_TOKEN'),
    /** WireWeb WhatsApp API. Uses Authorization: Bearer <api-key> + sessionId. */
    wirewebApiKey: optional('WIREWEB_API_KEY'),
    wirewebBaseUrl: optional('WIREWEB_BASE_URL', 'https://app.wireweb.co.in'),
    wirewebSessionId: optional('WIREWEB_SESSION_ID', 'default'),
    wirewebSendEndpoint: optional('WIREWEB_SEND_ENDPOINT', '/api/v1/messages'),
    wirewebMediaEndpoint: optional('WIREWEB_MEDIA_ENDPOINT', '/api/v1/media'),
    /** CallMeBot — free personal WhatsApp API (https://www.callmebot.com) */
    callMeBotApiKey: optional('CALLMEBOT_API_KEY'),
    callMeBotPhone: optional('CALLMEBOT_PHONE'),
  },

  rateLimit: {
    windowMs: Number(optional('RATE_LIMIT_WINDOW_MS', '900000')),
    max: Number(optional('RATE_LIMIT_MAX', '100')),
  },
} as const;
