import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const [messages, total] = await Promise.all([
      Message.find({ room: roomId })
        .populate("sender", "fullName username")
        .sort({ createdAt: 1 })
        .limit(limit),
      Message.countDocuments({ room: roomId }),
    ]);

    res.json({ messages, total });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
