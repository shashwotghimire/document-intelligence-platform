import { Router } from "express";
import {
  createChat,
  deleteChat,
  getAllChats,
  getChatById,
  updateChat,
} from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getAllChats);
router.get("/:chatId", authMiddleware, getChatById);
router.post("/", authMiddleware, createChat);
router.patch("/:chatId", authMiddleware, updateChat);
router.delete("/:chatId", authMiddleware, deleteChat);

export default router;
