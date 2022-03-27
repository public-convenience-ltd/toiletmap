import mongoose from 'mongoose';

export { default as Loo } from './loo';
export { default as Report } from './report';
export { default as Area } from './area';
export { default as MapGeo } from './mapgeo';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please provide the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
export const cached = !!global.mongoose
  ? global.mongoose
  : (global.mongoose = { conn: null, promise: null });

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
