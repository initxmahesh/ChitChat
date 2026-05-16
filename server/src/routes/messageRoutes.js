import express from "express";
import { getMessages } from "../controllers/messageController.js";
import protectRoute from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

router.get("/", protectRoute, getMessages);

export default router;
