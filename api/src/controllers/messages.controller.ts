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
import { generateAnswer } from "../services/llm.service";

export const sendMessage = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const { chatId } = req.params;
    const { content } = req.body;
    if (!chatId || Array.isArray(chatId)) {
      throw new ApiError(400, "Bad Request", "Missing Chat id");
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
    const prompt = `
    Use the following context to answer user query.
    **CONTEXT**
    ${context}. This is the top 5 chunks retrieved from vector database according to the user query.
    **USER QUERY**
    ${userMessage.content}

    **BAD QUERY**
    if user asks some irrelevant question or something out of scope of the document or something you cannot infer from the context, send some generic reply like i cannot answer this or something
    `;
    const aiResponse = await generateAnswer(prompt);
    // console.log(aiResponse);
    if (!aiResponse) {
      throw new ApiError(500, "AI response not found", "Internal server error");
    }
    const aiMessage = await Messages.create({
      chatId,
      content: aiResponse,
      messageRole: "ai",
    });
    res.status(201).json(
      new ApiResponse(true, "Message sent successfully", {
        userMessage,
        // topMatch: top5 ?? null,
        aiMessage,
      }),
    );
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
