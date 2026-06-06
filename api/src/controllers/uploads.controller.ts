import { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { Document } from "../models/document.model";
import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { DocumentChunk } from "../models/documentChunk.model";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import {
  deleteFromS3,
  getS3PresignedUrl,
  uploadToS3,
} from "../services/s3.service";
import sequelize from "../db";
import { logEvent } from "../services/logger.service";
import { getDocumentFileType } from "../utils/filetype";
import { processDocumentInBackground } from "../services/processDocument.service";

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

      const file = await Document.create({
        filename: originalname,
        fileType: getDocumentFileType(originalname),
        filePath: uploadedFile.key,
        fileSize: size,
        uploadedBy: req.user.id,
        fileProcessingStatus: "Processing",
      });

      res
        .status(200)
        .json(
          new ApiResponse(
            true,
            "File uploaded started processing in background",
            { file },
          ),
        );
      processDocumentInBackground(
        file,
        req.file.buffer,
        req.user.id,
        originalname,
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
      .json(
        new ApiResponse(true, "Stats fetched successfully", documentsWithUrl),
      );
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
