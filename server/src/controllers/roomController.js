import Room from "../models/Room.js";

export const createRoom = async (req, res) => {
  try {
    const { name, description, color, isPrivate, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Room name is required" });
    }

    if (isPrivate && (!password || password.length < 4)) {
      return res
        .status(400)
        .json({ message: "Private rooms need a password (min 4 chars)" });
    }

    const existing = await Room.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing) {
      return res.status(400).json({ message: "Room name already taken" });
    }

    const room = await Room.create({
      name: name.trim(),
      description: description?.trim() || "",
      color: color || "bg-brand-500",
      isPrivate: !!isPrivate,
      password: isPrivate ? password : "",
      createdBy: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(room.toPublicJSON());
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    const publicRooms = rooms.map((r) => r.toPublicJSON());
    res.json(publicRooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.isPrivate) {
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      const isMatch = await room.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
    }

    const alreadyMember = room.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!alreadyMember) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.json(room.toPublicJSON());
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate("members", "fullName username email")
      .populate("createdBy", "fullName");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room.toPublicJSON());
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
