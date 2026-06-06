import path from "path";
import { DocumentFileType } from "../models/document.model";
import { ApiError } from "./ApiError";

export const getDocumentFileType = (filename: string): DocumentFileType => {
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".pdf") return "pdf";
  if (extension === ".docx") return "docx";
  if (extension === ".txt") return "txt";
  if (extension === ".csv") return "csv";

  throw new ApiError(400, "Bad Request", "Unsupported file type");
};
