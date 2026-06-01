import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Logs } from "../models/logs.model";
import { User } from "../models/user.model";

export const getLogs = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { count, rows } = await Logs.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["name", "role"] }],
    });
    res.status(200).json(
      new ApiResponse(true, "Logs fetched successfully", {
        logs: rows,
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
