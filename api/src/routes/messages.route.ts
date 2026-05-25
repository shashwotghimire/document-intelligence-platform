import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messages.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  getMessagesSchema,
  sendMessageSchema,
} from "../validation/message.validation";

const router = Router();

router.post(
  "/:chatId",
  authMiddleware,
  validate(sendMessageSchema),
  sendMessage,
);
router.get(
  "/:chatId",
  authMiddleware,
  validate(getMessagesSchema),
  getMessages,
);

export default router;
