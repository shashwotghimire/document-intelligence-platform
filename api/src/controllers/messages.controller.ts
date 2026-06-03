import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import asyncHandler from "../utils/asyncHandler";
import { Messages, ReferencedDocument } from "../models/messages.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Chat } from "../models/chat.model";
import { generateEmbedding } from "../services/embeddings.service";
import sequelize from "../db";
import { QueryTypes } from "sequelize";
import { generateAnswer, streamResponse } from "../services/llm.service";
import {
  generateFollowUpQuestions,
  generateTitlePrompt,
  systemPrompt,
} from "../utils/prompt";
import { parseFollowUpQuestions } from "../utils/parseResponse";
import { logEvent } from "../services/logger.service";

const normalizeGeneratedTitle = (title?: string) => {
  return title
    ?.trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, 6)
    .join(" ");
};

export const sendMessage = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const { chatId } = req.params;
    const { content } = req.body;
    if (!chatId || Array.isArray(chatId)) {
      throw new ApiError(400, "Bad Request", "Missing Chat id");
    }
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        userId: req.user.id,
      },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found", "Invalid chat id");
    }
    const userMessage = await Messages.create({
      content,
      chatId,
      messageRole: "user",
    });

    const userQueryEmbedding = await generateEmbedding(userMessage.content);
    const top15 = await sequelize.query(
      `
       SELECT
      d."id" AS "documentId",
      d."filename" AS "documentName",
      d."file_type" AS "documentType",
      dc."id" AS "chunkId",
      dc."chunk_text" AS "chunkText",
      dc."chunk_index" AS "chunkIndex",
      dc."vector_embedding" <-> :embedding::vector AS distance
      FROM document_chunks dc
      JOIN documents d ON d.id = dc."document_id"
      ORDER BY dc."vector_embedding" <-> :embedding::vector
      LIMIT 15
      `,
      {
        replacements: {
          embedding: `[${userQueryEmbedding.join(",")}]`,
        },
        type: QueryTypes.SELECT,
      },
    );
    const context = top15
      .map(
        (chunk: any, index) =>
          `Source:${index + 1}: ${chunk.documentName}:\n ${chunk.chunkText}, `,
      )
      .join("\n\n");

    const referencedDocuments: ReferencedDocument[] = Array.from(
      new Map(
        top15.map((chunk: any) => [
          chunk.documentId,
          {
            documentId: chunk.documentId,
            documentTitle: chunk.documentName,
            documentType: chunk.documentType,
          },
        ]),
      ).values(),
    );
    const prompt = systemPrompt({ context, userMessage });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";
    let followUpQuestions: string[] = [];
    for await (const chunk of streamResponse(prompt)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ metadataLoading: true })}\n\n`);
    const noInfoMessage =
      fullResponse.trim() === "I don't have enough information to answer that.";

    const documentsToStore = noInfoMessage ? [] : referencedDocuments;
    if (!noInfoMessage) {
      try {
        const followUpQuestionsPrompt = generateFollowUpQuestions({
          userQuestion: userMessage.content,
          context,
          aiMessage: fullResponse,
        });
        const followUpQuestionsRaw = await generateAnswer(
          followUpQuestionsPrompt,
        );
        if (!followUpQuestionsRaw) {
          followUpQuestions = [];
        }
        followUpQuestions = parseFollowUpQuestions(followUpQuestionsRaw);
      } catch (e) {
        console.error(e);
      }
    }
    await Messages.create({
      chatId,
      content: fullResponse,
      messageRole: "ai",
      referencedDocuments: documentsToStore,
      followUpQuestions,
    });
    const currentMessageCount = chat.count ?? 0;
    const isFirstMessage = currentMessageCount === 0;
    const chatUpdate: { count: number; title?: string } = {
      count: currentMessageCount + 1,
    };

    if (isFirstMessage) {
      try {
        const generatedTitle = await generateAnswer(
          generateTitlePrompt(content),
        );
        const title = normalizeGeneratedTitle(generatedTitle);
        if (title) {
          chatUpdate.title = title;
        }
      } catch (e) {
        throw new ApiError(
          400,
          "Error generating title",
          "Failed to generate title",
        );
      }
    }
    await Chat.update(chatUpdate, {
      where: { id: chatId },
    });
    await logEvent(req.user.id, "message_sent", `Chat ${chatId}: ${content}`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  },
);

export const getMessages = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { chatId } = req.params;
    const userId = req.user.id;
    const chat = await Chat.findOne({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found", "Invalid chat id");
    }

    const { count, rows } = await Messages.findAndCountAll({
      where: {
        chatId,
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(
      new ApiResponse(
        true,
        `Messages in chat ${chat.title} fetched successfully`,
        {
          messages: rows,
          pagination: {
            page,
            limit,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
          },
        },
      ),
    );
  },
);
