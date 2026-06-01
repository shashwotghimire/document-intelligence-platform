import { Router } from "express";
import { getLogs } from "../controllers/logs.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rolesGuard } from "../middlewares/roles.middleware";
import { validate } from "../middlewares/validation.middleware";
import { getLogsSchema } from "../validation/log.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: User-scoped application logs
 */

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: List logs for the authenticated user
 *     tags: [Logs]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Logs fetched successfully
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
 *                         logs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Log'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     summary: Create a log for the authenticated user
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action, data]
 *             properties:
 *               action:
 *                 type: string
 *                 example: document_uploaded
 *               data:
 *                 type: string
 *                 example: Uploaded quarterly-report.pdf
 *     responses:
 *       201:
 *         description: Log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Log'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/",
  authMiddleware,
  rolesGuard("admin"),
  validate(getLogsSchema),
  getLogs,
);

export default router;
