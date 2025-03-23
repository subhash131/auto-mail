import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDb() {
  if (cached.conn) {
    console.log("Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new database connection");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false, // Improves performance
      })
      .then((mongoose) => {
        return mongoose;
      })
      .catch((err) => {
        console.error("Database connection failed", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    throw new Error("Failed to connect to database");
  }
}
