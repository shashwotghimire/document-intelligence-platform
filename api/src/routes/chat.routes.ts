import { Router } from "express";
import {
  createChat,
  deleteChat,
  getAllChats,
  getChatById,
  updateChat,
} from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  createChatSchema,
  deleteChatSchema,
  getAllChatsSchema,
  getChatByIdSchema,
  updateChatSchema,
} from "../validation/chat.validation";

const router = Router();

router.get("/", authMiddleware, validate(getAllChatsSchema), getAllChats);
router.get(
  "/:chatId",
  authMiddleware,
  validate(getChatByIdSchema),
  getChatById,
);
router.post("/", authMiddleware, validate(createChatSchema), createChat);
router.patch(
  "/:chatId",
  authMiddleware,
  validate(updateChatSchema),
  updateChat,
);
router.delete(
  "/:chatId",
  authMiddleware,
  validate(deleteChatSchema),
  deleteChat,
);

export default router;
