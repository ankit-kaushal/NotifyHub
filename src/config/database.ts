import mongoose from 'mongoose';
import { buildMongoUri } from '../lib/mongo';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  const uri = env.mongo.uri || buildMongoUri();

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  console.info('[db] Connected to MongoDB');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.info('[db] Disconnected from MongoDB');
}
