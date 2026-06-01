import { Response } from "express";
import path from "path";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { Document, DocumentFileType } from "../models/document.model";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { extractText } from "../services/parse-documents.service";
import { chunkDocument } from "../services/chunk.service";
import { DocumentChunk } from "../models/documentChunk.model";
import { generateEmbedding } from "../services/embeddings.service";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { deleteFromS3, getS3PresignedUrl, uploadToS3 } from "../services/s3.service";
import sequelize from "../db";
import { logEvent } from "../services/logger.service";

const getDocumentFileType = (filename: string): DocumentFileType => {
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".pdf") return "pdf";
  if (extension === ".docx") return "docx";
  if (extension === ".txt") return "txt";
  if (extension === ".csv") return "csv";

  throw new ApiError(400, "Bad Request", "Unsupported file type");
};

export const uploadFile = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "Bad Request", "No file uploaded");
    }

    const { originalname, size } = req.file;
    let uploadedFileKey: string | null = null;
    try {
      const uploadedFile = await uploadToS3(req.file);
      uploadedFileKey = uploadedFile.key;
      const rawText = await extractText(
        req.file!.buffer,
        getDocumentFileType(originalname),
      );
      const chunks = await chunkDocument(rawText);
      const chunksWithEmbeddings = await Promise.all(
        chunks.map(async (chunk, index) => {
          const embedding = await generateEmbedding(chunk);

          return {
            chunkText: chunk,
            chunkIndex: index,
            vectorEmbedding: embedding,
          };
        }),
      );
      const file = await sequelize.transaction(async (t) => {
        const file = await Document.create(
          {
            filename: originalname,
            fileType: getDocumentFileType(originalname),
            filePath: uploadedFile.key,
            fileSize: size,
            uploadedBy: req.user.id,
            fileProcessingStatus: "Processing",
          },
          { transaction: t },
        );

        await DocumentChunk.bulkCreate(
          chunksWithEmbeddings.map((chunk) => ({
            ...chunk,
            documentId: file.id,
          })),
          {
            transaction: t,
          },
        );
        file.fileProcessingStatus = "Processed";
        await file.save({ transaction: t });
        return file;
      });

      await logEvent(req.user.id, "file_uploaded", `Uploaded ${originalname}`);
      return res.status(200).json(
        new ApiResponse(true, "file uploaded successfully", {
          file,
          // chunks,
          // chunksWithEmbeddings,
        }),
      );
    } catch (error) {
      if (uploadedFileKey) {
        await deleteFromS3(uploadedFileKey).catch(console.error);
      }
      throw error;
    }
  },
);

export const getFileStats = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const [totalDocuments, totalChunks, totalSize, totalUsers] =
      await Promise.all([
        Document.count(),
        DocumentChunk.count(),
        Document.sum("fileSize"),
        User.count(),
      ]);
    return res.status(200).json(
      new ApiResponse(true, "Stats fetched successfully", {
        totalDocuments,
        totalChunks,
        totalSize,
        totalUsers,
      }),
    );
  },
);

export const getStatsForTable = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const documents = await Document.findAll({
      where: {
        uploadedBy: req.user.id,
      },
      include: {
        model: User,
        as: "uploader",
        attributes: ["name", "role"],
      },
    });
    const documentsWithUrl = await Promise.all(
      documents.map(async (doc) => ({
        ...doc.toJSON(),
        fileUrl: await getS3PresignedUrl(doc.filePath),
      })),
    );
    return res
      .status(200)
      .json(new ApiResponse(true, "Stats fetched successfully", documentsWithUrl));
  },
);

export const deleteFile = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const { documentId } = req.params;

    if (!documentId || Array.isArray(documentId)) {
      throw new ApiError(400, "Bad Request", "Missing document id");
    }

    const document = await Document.findOne({
      where: {
        id: documentId,
        uploadedBy: req.user.id,
      },
    });

    if (!document) {
      throw new ApiError(404, "Document not found", "Invalid document id");
    }
    await deleteFromS3(document.filePath);
    await sequelize.transaction(async (t) => {
      await DocumentChunk.destroy({
        where: {
          documentId: document.id,
        },
        transaction: t,
      });
      await document.destroy({ transaction: t });
    });
    await logEvent(req.user.id, "file_deleted", `Deleted ${document.filename}`);
    return res
      .status(200)
      .json(new ApiResponse(true, "File deleted successfully", null));
  },
);
