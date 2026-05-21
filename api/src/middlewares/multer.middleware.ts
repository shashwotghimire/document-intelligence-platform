import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError";

const allowedExtensions = new Set([".pdf", ".docx", ".txt", ".csv"]);

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return cb(new ApiError(400, "Bad Request", "Unsupported file type"));
    }

    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
