import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Service health checks
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       example: API is running
 */
router.get("/", getHealth);

export default router;
