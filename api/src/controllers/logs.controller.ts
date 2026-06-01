import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Logs } from "../models/logs.model";

export const createLog = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const { action, data } = req.body;
    const log = await Logs.create({
      userId: req.user.id,
      action,
      data,
    });
    res
      .status(201)
      .json(new ApiResponse(true, "Log created successfully", log));
  },
);

export const getLogs = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const { count, rows } = await Logs.findAndCountAll({
      where: {
        userId: req.user.id,
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
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
