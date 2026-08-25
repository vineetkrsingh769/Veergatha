import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // Deliberately not fatal: the Hello World deploy must come up before Atlas
    // is wired, so the health check can prove the pipeline works on its own.
    console.warn("[db] MONGODB_URI not set — starting without a database connection");
    return null;
  }

  mongoose.set("strictQuery", true);

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`[db] connected to ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[db] connection failed: ${err.message}`);
    throw err;
  }
}

export function dbStatus() {
  // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  return ["disconnected", "connected", "connecting", "disconnecting"][
    mongoose.connection.readyState
  ];
}
