import express from "express";
import {
  createRoom,
  getRooms,
  joinRoom,
  getRoom,
} from "../controllers/roomController.js";
import protectRoute from "../middleware/auth.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createRoom);
router.get("/", getRooms);
router.get("/:roomId", getRoom);
router.post("/:roomId/join", joinRoom);

export default router;
