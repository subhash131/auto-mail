import mongoose from "mongoose";

let isConnected = false;

export async function connectToDb() {
  try {
    if (isConnected) {
      console.log("Already connected to database");
      return mongoose.connection;
    }
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not set");
    }

    const db = await mongoose.connect(uri);
    isConnected = true;
    return db.connection;
  } catch (error) {
    console.log(error);
  }
}
