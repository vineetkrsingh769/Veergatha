import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
  } catch {
    // connectDB already logged the reason. Keep serving so /api/health can
    // report db: "disconnected" instead of the whole box looking dead.
  }

  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });

  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      console.log(`[api] ${signal} received, shutting down`);
      server.close(() => process.exit(0));
    });
  }
}

start();
