import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import asyncHandler from "../utils/asyncHandler";
import { Messages } from "../models/messages.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Chat } from "../models/chat.model";
import { generateEmbedding } from "../services/embeddings.service";
import sequelize from "../db";
import { QueryTypes } from "sequelize";
import { streamResponse } from "../services/llm.service";
import { generateTitlePrompt, systemPrompt } from "../utils/prompt";

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
    const top5 = await sequelize.query(
      `
      SELECT
    id,
    "documentId",
    "chunkText",
    "chunkIndex",
    "vectorEmbedding" <-> :embedding::vector AS distance
  FROM document_chunks
  ORDER BY "vectorEmbedding" <-> :embedding::vector
  LIMIT 5
      `,
      {
        replacements: {
          embedding: `[${userQueryEmbedding.join(",")}]`,
        },
        type: QueryTypes.SELECT,
      },
    );
    const context = top5.map((chunk: any) => chunk.chunkText).join("\n\n");
    const prompt = systemPrompt({ context, userMessage });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";

    for await (const chunk of streamResponse(prompt)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    const aiMessage = await Messages.create({
      chatId,
      content: fullResponse,
      messageRole: "ai",
    });
    const currentMessageCount = chat.count ?? 0;
    const isFirstMessage = currentMessageCount === 0;
    const chatUpdate: { count: number; title?: string } = {
      count: currentMessageCount + 1,
    };

    if (isFirstMessage) {
      const generatedTitle = generateTitlePrompt(content);
      const title = generatedTitle?.trim();
      if (title) {
        chatUpdate.title = title;
      }
    }
    await Chat.update(chatUpdate, {
      where: { id: chatId },
    });
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
