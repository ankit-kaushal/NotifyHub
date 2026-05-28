function encode(value: string): string {
  return encodeURIComponent(value);
}

export function buildMongoUri(): string {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const { DB_USERNAME, DB_PASSWORD, DB_CLUSTER, DB_NAME } = process.env;
  const uri =
    DB_USERNAME && DB_PASSWORD && DB_CLUSTER && DB_NAME
      ? `mongodb+srv://${encode(DB_USERNAME)}:${encode(DB_PASSWORD)}@${DB_CLUSTER}.s7w4ras.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=${encode(DB_CLUSTER)}`
      : '';

  if (!uri) throw new Error('MongoDB environment variables are missing.');
  return uri;
}
