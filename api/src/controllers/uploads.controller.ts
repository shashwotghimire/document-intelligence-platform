import { Response } from "express";
import fs from "fs/promises";
import path from "path";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { Document, DocumentFileType } from "../models/document.model";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { extractText } from "../services/textExtractor.service";
import { chunkDocument } from "../services/chunk.service";
import { DocumentChunk } from "../models/documentChunk.model";
import { generateEmbedding } from "../services/embeddings.service";
const getDocumentFileType = (filename: string): DocumentFileType => {
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".pdf") return "pdf";
  if (extension === ".docx") return "docx";
  if (extension === ".txt") return "txt";

  throw new ApiError(400, "Bad Request", "Unsupported file type");
};

export const uploadFile = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "Bad Request", "No file uploaded");
    }

    const { originalname, path: filePath, size } = req.file;

    try {
      const file = await Document.create({
        filename: originalname,
        fileType: getDocumentFileType(originalname),
        filePath,
        fileSize: size,
        uploadedBy: req.user.id,
        fileProcessingStatus: "Processing",
      });
      const rawText = await extractText(file.filePath, file.fileType);
      const chunks = await chunkDocument(rawText);

      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (chunk, index) => {
          const embedding = await generateEmbedding(chunk);

          return {
            documentId: file.id,
            chunkText: chunk,
            chunkIndex: index,
            vectorEmbedding: embedding,
          };
        }),
      );
      await DocumentChunk.bulkCreate(chunksWithEmbeddings);
      file.fileProcessingStatus = "Processed";
      await file.save();
      return res.status(200).json({
        success: true,
        message: "file uploaded successfully",
        data: {
          file,
          // chunks,
          // chunksWithEmbeddings,
        },
      });
    } catch (error) {
      await fs.unlink(filePath).catch(() => undefined);
      throw error;
    }
  },
);
