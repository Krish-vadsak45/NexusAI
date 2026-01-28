import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define mongo_uri in env variables");
  }

  if (cached.conn) {
    return cached.conn;
  }

  cached.promise ??= mongoose
    .connect(MONGODB_URI)
    .then(() => mongoose.connection);

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
