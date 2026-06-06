import { extractText } from "./parse-documents.service";
import { getDocumentFileType } from "../utils/filetype";
import { chunkDocument } from "./chunk.service";
import { generateEmbedding } from "./embeddings.service";
import sequelize from "../db";
import { DocumentChunk } from "../models/documentChunk.model";
import { Document } from "../models/document.model";
import { logEvent } from "./logger.service";
export async function processDocumentInBackground(
  file: Document,
  buffer: Buffer,
  userId: string,
  originalName: string,
) {
  try {
    const rawText = await extractText(
      buffer,
      getDocumentFileType(originalName),
    );
    const chunks = await chunkDocument(rawText);

    const BATCH_SIZE = 10;

    const chunksWithEmbeddings: {
      chunkText: string;
      chunkIndex: number;
      vectorEmbedding: number[];
    }[] = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (chunk, batchIndex) => {
          const embedding = await generateEmbedding(chunk);
          return {
            chunkText: chunk,
            chunkIndex: i + batchIndex,
            vectorEmbedding: embedding,
          };
        }),
      );
      chunksWithEmbeddings.push(...batchResults);
    }
    await sequelize.transaction(async (t) => {
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
    });
    await logEvent(userId, "file_uploaded", `Uploaded ${originalName}`);
  } catch (e) {
    await file.update({ fileProcessingStatus: "Failed" }).catch(console.error);
    console.error(`Background processing failed for document ${file.id}:`, e);
  }
}
