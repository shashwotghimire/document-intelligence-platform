import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messages.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/:chatId", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, getMessages);

export default router;
