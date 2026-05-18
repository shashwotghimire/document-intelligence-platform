import { Router } from "express";
import { getFileStats, uploadFile } from "../controllers/uploads.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { rolesGuard } from "../middlewares/roles.middleware";

const router: Router = Router();

router.post(
  "/",
  authMiddleware,
  rolesGuard("admin"),
  upload.single("file"),
  uploadFile,
);
router.get("/stats", authMiddleware, rolesGuard("admin"), getFileStats);

export default router;
