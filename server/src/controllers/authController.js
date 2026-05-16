import User from "../models/User.js";
import Room from "../models/Room.js";
import Message from "../models/Message.js";
import generateToken from "../utils/generateToken.js";

const publicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  username: user.username ?? null,
  email: user.email,
});

export const register = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers and underscores",
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res
        .status(400)
        .json({ message: "Username must be 3–20 characters" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password,
    });

    generateToken(user._id, res);
    res.status(201).json(publicUser(user));
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);
    res.json(publicUser(user));
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  res.json(publicUser(req.user));
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Remove user's messages
    await Message.deleteMany({ sender: userId });

    // Remove user from all room member lists
    await Room.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete the user document
    await User.findByIdAndDelete(userId);

    // Clear the JWT cookie
    res.cookie("jwt", "", { maxAge: 0 });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, email } = req.body;
    const userId = req.user._id;
    const updates = {};

    if (fullName?.trim()) {
      if (fullName.trim().length < 2) {
        return res
          .status(400)
          .json({ message: "Name must be at least 2 characters" });
      }
      updates.fullName = fullName.trim();
    }

    if (username?.trim()) {
      const u = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]+$/.test(u)) {
        return res.status(400).json({
          message:
            "Username can only contain letters, numbers and underscores",
        });
      }
      if (u.length < 3 || u.length > 20) {
        return res
          .status(400)
          .json({ message: "Username must be 3–20 characters" });
      }
      const taken = await User.findOne({ username: u, _id: { $ne: userId } });
      if (taken) {
        return res.status(400).json({ message: "Username already taken" });
      }
      updates.username = u;
    }

    if (email?.trim()) {
      const e = email.trim().toLowerCase();
      const taken = await User.findOne({ email: e, _id: { $ne: userId } });
      if (taken) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updates.email = e;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(publicUser(user));
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
