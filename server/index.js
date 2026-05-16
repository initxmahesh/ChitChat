import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import roomRoutes from "./src/routes/roomRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import socketHandler from "./src/socket/socketHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const rawOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const origin = rawOrigin.includes(",")
  ? rawOrigin.split(",").map((o) => o.trim())
  : rawOrigin;

const io = new Server(httpServer, {
  cors: {
    origin: origin,
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: origin,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/rooms/:roomId/messages", messageRoutes);

socketHandler(io);

app.use(express.static(path.join(__dirname, "public")));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  connectDB();
});
