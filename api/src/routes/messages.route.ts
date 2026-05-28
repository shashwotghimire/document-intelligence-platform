import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/messages.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  getMessagesSchema,
  sendMessageSchema,
} from "../validation/message.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Chat messages and streaming responses
 */

/**
 * @swagger
 * /api/messages/{chatId}:
 *   post:
 *     summary: Send a message and stream the AI response
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: Summarize the uploaded document.
 *     responses:
 *       200:
 *         description: Server-sent event stream of AI response chunks
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: 'data: {"chunk":"Hello"}\n\ndata: {"done":true}\n\n'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Chat not found
 *   get:
 *     summary: List messages in a chat
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         messages:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Message'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Chat not found
 */
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
