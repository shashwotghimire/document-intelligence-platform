import { NextFunction, Request, RequestHandler, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

export const getHealth: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res
      .status(200)
      .json(new ApiResponse(true, "Health check successful", "API is running"));
  },
);
