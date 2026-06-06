import { Router } from "express";
import {
  deleteFile,
  getFileStats,
  getStatsForTable,
  uploadFile,
} from "../controllers/uploads.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { rolesGuard } from "../middlewares/roles.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  deleteDocumentSchema,
  getDocumentsTableSchema,
  uploadDocumentSchema,
} from "../validation/document.validation";

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Document upload, stats, and deletion
 */

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Upload and process a document
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF, DOCX, TXT, or CSV document
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                         file:
 *                           $ref: '#/components/schemas/Document'
 *       400:
 *         description: Missing file or unsupported file type
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  "/",
  authMiddleware,
  rolesGuard("admin"),
  upload.single("file"),
  validate(uploadDocumentSchema),
  uploadFile,
);

/**
 * @swagger
 * /api/uploads/stats:
 *   get:
 *     summary: Get aggregate document stats
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Stats'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get("/stats", authMiddleware, rolesGuard("admin"), getFileStats);

/**
 * @swagger
 * /api/uploads/tableStats:
 *   get:
 *     summary: Get uploaded documents for the authenticated admin
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Document'
 *                           - type: object
 *                             properties:
 *                               uploader:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   role:
 *                                     type: string
 *                                     enum: [user, admin]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  "/tableStats",
  authMiddleware,
  rolesGuard("admin"),
  validate(getDocumentsTableSchema),
  getStatsForTable,
);

/**
 * @swagger
 * /api/uploads/{documentId}:
 *   delete:
 *     summary: Delete a document and its chunks
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Document not found
 */
router.delete(
  "/:documentId",
  authMiddleware,
  rolesGuard("admin"),
  validate(deleteDocumentSchema),
  deleteFile,
);

export default router;
