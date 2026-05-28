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

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat session management
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: List chats for the authenticated user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chats fetched successfully
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
 *                         chats:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Chat'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Create a chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Chat'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", authMiddleware, validate(getAllChatsSchema), getAllChats);
router.post("/", authMiddleware, validate(createChatSchema), createChat);

/**
 * @swagger
 * /api/chats/{chatId}:
 *   get:
 *     summary: Get a chat by id
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chat fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Chat'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Chat not found
 *   patch:
 *     summary: Update a chat title
 *     tags: [Chats]
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
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 example: Quarterly report summary
 *     responses:
 *       200:
 *         description: Chat updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Chat not found
 *   delete:
 *     summary: Delete a chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Chat not found
 */
router.get(
  "/:chatId",
  authMiddleware,
  validate(getChatByIdSchema),
  getChatById,
);
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
