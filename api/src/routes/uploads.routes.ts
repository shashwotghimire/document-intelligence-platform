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
  uploadDocumentSchema,
} from "../validation/document.validation";

const router: Router = Router();

router.post(
  "/",
  authMiddleware,
  rolesGuard("admin"),
  upload.single("file"),
  validate(uploadDocumentSchema),
  uploadFile,
);
router.get("/stats", authMiddleware, rolesGuard("admin"), getFileStats);
router.get(
  "/tableStats",
  authMiddleware,
  rolesGuard("admin"),
  getStatsForTable,
);
router.delete(
  "/:documentId",
  authMiddleware,
  rolesGuard("admin"),
  validate(deleteDocumentSchema),
  deleteFile,
);

export default router;
