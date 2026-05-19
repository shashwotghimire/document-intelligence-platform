import multer from "multer";
import fs from "fs";
import path from "path";
import { ApiError } from "../utils/ApiError";

const allowedExtensions = new Set([".pdf", ".docx", ".txt", ".csv"]);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return cb(new ApiError(400, "Bad Request", "Unsupported file type"));
    }

    cb(null, true);
  },
});
