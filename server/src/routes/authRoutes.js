import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  deleteAccount,
} from "../controllers/authController.js";
import protectRoute from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.put("/profile", protectRoute, updateProfile);
router.delete("/account", protectRoute, deleteAccount);

export default router;