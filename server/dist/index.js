"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const feedback_routes_1 = __importDefault(require("./routes/feedback.routes"));
const code_socket_1 = require("./sockets/code.socket");
const app = (0, express_1.default)();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use((0, cors_1.default)({ origin: CLIENT_URL }));
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/feedback", feedback_routes_1.default);
app.get("/", (req, res) => {
    res.send("Backend Running...");
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: CLIENT_URL },
});
(0, code_socket_1.registerCodeSocket)(io);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
