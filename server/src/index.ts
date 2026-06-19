import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes";
import feedbackRoutes from "./routes/feedback.routes";
import { registerCodeSocket } from "./sockets/code.socket";
import prisma from "./utils/prisma";

const app = express();

// Allowed origins: comma-separated CLIENT_URL list + localhost, plus any *.vercel.app deploy
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true; // non-browser requests (curl, server-to-server)
  if (allowedOrigins.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".vercel.app")) return true; // production + preview deploys
  } catch {
    return false;
  }
  return false;
};

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/{*wildcard}", cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running...");
});

// Diagnostic: checks DB connectivity + required env vars
app.get("/api/health", async (req, res) => {
  const report: Record<string, unknown> = {
    jwtSecretSet: !!process.env.JWT_SECRET,
    databaseUrlSet: !!process.env.DATABASE_URL,
  };
  try {
    await prisma.$queryRaw`SELECT 1`;
    report.db = "connected";
    res.json({ ok: true, ...report });
  } catch (error) {
    report.db = "error";
    report.dbError = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, ...report });
  }
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  },
});

registerCodeSocket(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")} (+ *.vercel.app)`);
});
