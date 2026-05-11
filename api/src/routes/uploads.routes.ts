import { Router } from "express";
import { uploadFile } from "../controllers/uploads.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router: Router = Router();

router.post("/", authMiddleware, upload.single("file"), uploadFile);

export default router;
