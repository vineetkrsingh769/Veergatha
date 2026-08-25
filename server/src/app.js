import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dbStatus } from "./config/db.js";
import { api } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1); // Render sits behind a proxy; needed for rate limiting later

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));

  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: origins.length ? origins : true,
      credentials: true,
    })
  );

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      service: "veergatha-api",
      env: process.env.NODE_ENV ?? "development",
      db: dbStatus(),
      time: new Date().toISOString(),
    });
  });

  app.use("/api", api);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.originalUrl });
  });

  // eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
  app.use((err, req, res, next) => {
    const status = err.status ?? 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      error: status >= 500 ? "Internal server error" : err.message,
    });
  });

  return app;
}
