import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes";
import feedbackRoutes from "./routes/feedback.routes";
import { registerCodeSocket } from "./sockets/code.socket";

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

app.use(cors({
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options("*", cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running...");
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL },
});

registerCodeSocket(io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
