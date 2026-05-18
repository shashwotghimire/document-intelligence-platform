import { Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { Chat } from "../models/chat.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ApiResponse } from "../utils/ApiResponse";
import { Op } from "sequelize";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";

export const createChat = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const chat = await Chat.create({
      userId,
    });
    res
      .status(201)
      .json(new ApiResponse(true, "Chat created successfully", chat));
  },
);

export const getAllChats = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = req.query.search;
    const offset = (page - 1) * limit;

    let whereClause: any = { userId };
    if (searchQuery) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          {
            title: { [Op.iLike]: `%${searchQuery}%` },
          },
        ],
      };
    }
    const { count, rows } = await Chat.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json(
      new ApiResponse(true, "Chats fetched successfully", {
        chats: rows,
        pagination: {
          page,
          limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit),
        },
      }),
    );
  },
);

export const getChatById = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found", "Invalid chat id");
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "Chat fetched successfully", chat));
  },
);

export const deleteChat = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found", "Invalid chat id");
    }

    await chat.destroy();

    return res
      .status(200)
      .json(new ApiResponse(true, "Chat deleted successfully", null));
  },
);

export const updateChat = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { title } = req.body as { title?: string };

    if (!title) {
      throw new ApiError(400, "Bad Request", "Title is required");
    }

    const chat = await Chat.findOne({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new ApiError(404, "Chat not found", "Invalid chat id");
    }

    chat.title = title;
    await chat.save();

    return res
      .status(200)
      .json(new ApiResponse(true, "Chat updated successfully", chat));
  },
);
