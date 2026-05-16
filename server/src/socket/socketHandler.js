import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/User.js";
import Message from "../models/Message.js";

export default function socketHandler(io) {
  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || "";
      const cookies = cookie.parse(raw);
      const token = cookies.jwt;

      if (!token) return next(new Error("Not authenticated"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  // Connection
  io.on("connection", (socket) => {
    const { _id, fullName, username } = socket.user;

    // join_room 
    socket.on("join_room", async ({ roomId }) => {
      socket.join(roomId);
      if (!socket.joinedRooms) socket.joinedRooms = new Set();
      socket.joinedRooms.add(roomId);

      // Tell everyone else this user joined
      socket.to(roomId).emit("user_joined", { _id, fullName, username });

      // Send the joining user the live list of everyone currently in the room
      // (includes the socket that just joined, so the user sees themselves too)
      try {
        const socketsInRoom = await io.in(roomId).fetchSockets();
        const onlineUsers = socketsInRoom.map((s) => ({
          _id: s.user._id,
          fullName: s.user.fullName,
          username: s.user.username,
        }));
        socket.emit("room_users", onlineUsers);
      } catch (err) {
        console.error("room_users fetch error:", err);
      }
    });

    // send_message
    socket.on("send_message", async ({ roomId, text }) => {
      if (!text?.trim()) return;

      try {
        const msg = await Message.create({
          room: roomId,
          sender: _id,
          text: text.trim(),
        });

        const populated = await msg.populate("sender", "fullName username");

        io.to(roomId).emit("receive_message", populated);
      } catch (err) {
        console.error("send_message error:", err);
      }
    });

    // typing_start
    socket.on("typing_start", ({ roomId }) => {
      if (!socket.typingRooms) socket.typingRooms = new Set();
      socket.typingRooms.add(roomId);
      socket.to(roomId).emit("user_typing", { _id, fullName });
    });

    // typing_stop
    socket.on("typing_stop", ({ roomId }) => {
      socket.typingRooms?.delete(roomId);
      socket.to(roomId).emit("user_stopped_typing", { _id });
    });

    // leave_room
    socket.on("leave_room", ({ roomId }) => {
      socket.joinedRooms?.delete(roomId);
      socket.typingRooms?.delete(roomId);
      socket.to(roomId).emit("user_stopped_typing", { _id });
      socket.to(roomId).emit("user_left", { _id, fullName });
      socket.leave(roomId);
    });

    // disconnect
    // Fires on browser tab close / network drop — clean up all rooms
    socket.on("disconnect", () => {
      if (socket.typingRooms) {
        for (const roomId of socket.typingRooms) {
          socket.to(roomId).emit("user_stopped_typing", { _id });
        }
      }
      // Notify rooms that weren't cleanly left (abrupt close)
      if (socket.joinedRooms) {
        for (const roomId of socket.joinedRooms) {
          socket.to(roomId).emit("user_left", { _id, fullName });
        }
      }
    });
  });
}
